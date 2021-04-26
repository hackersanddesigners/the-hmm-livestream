require('dotenv').config()
const settings = require('./settings.json')
const fs = require('fs').promises
const fsextra = require('fs-extra');
const path = require('path')
const express = require('express')
const cors = require('cors')
const basicAuth = require('basic-auth')
const app = express()
const Mux = require('@mux/mux-node')
const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET)
let STREAM
const db = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const http = require('http').Server(app)
const socket = require('socket.io')(http)
const nunjucks = require('nunjucks')

app.use('/assets', express.static(path.resolve(__dirname, 'assets')))
app.use(express.static(path.resolve(__dirname, 'files')))
app.use(express.json())

// storage configuration
const stateFilePath = './.data/stream'

// <https://stackoverflow.com/a/26345063>
const URLmatch = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+")

// authentication configuration
const webhookUser = {
  name: 'muxer',
  pass: 'muxology',
}

// authentication middleware
const auth = (req, res, next) => {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required')
    return res.sendStatus(401)
  }
  const user = basicAuth(req)
  console.log(user)
  if (!user || !user.name || !user.pass) {
    return unauthorized(res)
  }
  if (user.name === webhookUser.name && user.pass === webhookUser.pass) {
    return next()
  } else {
    return unauthorized(res)
  }
}

// creates a new live stream so we can get a stream key
const createLiveStream = async () => {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    console.error("It looks like you haven't set up your Mux token in the .env file yet.")
    return
  }

  // create a new live stream!
  return await Video.LiveStreams.create({
    test: settings.stream.testmode,
    playback_policy: 'public',
    reconnect_window: 10,
    new_asset_settings: { playback_policy: 'public' } 
  })
}

// reads a state file looking for an existing live stream, if it can't find one, 
// creates a new one, saving the new live stream to our state file and global stream variable.
const initialize = async() => {
  try {
    const stateFile = await fs.readFile(stateFilePath, 'utf8')
    STREAM = JSON.parse(stateFile)
    console.log('Found an existing stream! Fetching updated data.')
    STREAM = await Video.LiveStreams.get(STREAM.id)
  } catch (err) {
    console.log('No stream found, creating a new one.')
    STREAM = await createLiveStream()
    await fs.writeFile(stateFilePath, JSON.stringify(STREAM))
  }
  return STREAM
}

// lazy way to find a public playback id (just returns the first...)
const getPlaybackId = stream => stream['playback_ids'][0].id

// let's pass only useful stream info
const publicStreamDetails = stream => ({
  status: stream.status,
  playbackId: getPlaybackId(stream),
})


// setup db
const adapter = new FileAsync('./.data/db.json')

// -- wrap low.db around endpoints
db(adapter)
  .then(db => {
    // -- /posts
    app.get('/posts', async(req, res) => {
      const posts = db.get('posts').value()
      res.send(posts)
    })

    // -- /posts/urls
    app.get('/posts/url', async(req, res) => {
      const posts = db.get('posts').value()
      const URLs = getURLfromPost(posts)

      res.send(URLs)
    })

    // -- /chat-reference, export all links shared in the chat
    app.get('/api/get-chat-urls', async(req, res) => {
      // 1. get posts
      // 2. parse all URLs
      // 3. create .html
      // 4. send back URL download 

      try { 

        // create export folder if does not exist
        const exportFolder = path.resolve(__dirname, process.env.EXPORT_FOLDER)
        await fsextra.ensureDir(exportFolder)

        const posts = db.get('posts').value()

        // before generating a new html file,
        // check if an existing one outputted after the last chat-msg exists

        // get list of files from export-folder
        const exportFiles = await fs.readdir(exportFolder)

        const localhost = `http://${req.get('host')}`
        const documentURL = await exportDoc(exportFiles, exportFolder, posts, localhost) 

        res.send({
          url: documentURL
        })

      } catch (err) {
        console.log('err =>', err)

        res.status(500).send({
          error: err,
          message : 'The file does not exist'
        })
      }

    })

    // -- socket.io
    socket.on('connection', (sock) => {
      const userCount = sock.client.conn.server.clientsCount
      console.log('a user connected, total user', userCount)
      socket.emit('user-count',  userCount)

      sock.on('disconnect', () => {
        console.log('a user disconnected, total user', userCount -1)
        socket.emit('user-count',  userCount -1)
      })

      sock.on('chat-msg', (msg) => {
        console.log('msg', msg)
        socket.emit('chat-msg', msg)

        db.get('posts')
          .push(msg)
          .last()
          .write()
      })

      return db.defaults({posts: [] }).write()
    })

  })


// HTML templating
nunjucks.configure('views', {
  autoescape: true,
  express: app
});

// serve index.html with choo app
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'))
})

// -- /stream, bootstrap the live-stream
app.get('/stream', async(req, res) => {
  const stream = await Video.LiveStreams.get(STREAM.id)
  res.json(
    publicStreamDetails(stream)
  )
})

// -- mux-hook, listen to mux callbacks
app.post('/mux-hook', (req, res) => {
  console.log('mux-hook =>', req.body)
  STREAM.status = req.body.data.status
  
  if (req.body.type === 'video.live_stream.idle' || req.body.type === 'video.live_stream.active') {
    socket.emit('stream-update', publicStreamDetails(STREAM))
  }

  res.sendStatus(200)
})

if (settings.donate) {
  const { createMollieClient } = require('@mollie/api-client');
  const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

  app.post('/donate', async(req, res) => {
    let data = req.body
    console.log('data =>', data)
    try {
      const payment = await mollieClient.payments.create({
        amount: {
          currency: 'EUR',
          value: data.amount,
        },
        metadata: {
          order_id: Buffer.from(new Date(), 'utf8').toString('hex'),
        },
        description: data.description,
        redirectUrl: process.env.MOLLIE_REDIRECT_URL,
        webhookUrl: process.env.MOLLIE_WEBHOOK_URL
      })

      console.log('donate-payment =>', payment)
      res.send(payment)
      // console.log('getPaymentUrl =>', payment._links.checkout)
      // res.redirect(payment._links.checkout.url)
    } catch (error) {
      console.warn('donate-err =>', error)
      res.send(error)
    }
  })

  app.post('/donate/webhook', async(req, res) => {
    console.log('/donate/webhook =>', req.body)
    // const payment = await mollieClient.payments.get(req.body.orderId)
    // const data = await payment.json()
    // console.log(data)
    
    res.sendStatus(200)
  })
}

function getURLfromPost(posts) {
  const URLs = []

  posts.map(post => {
    return post.value.match(URLmatch)
  }).filter(item => {
    if (item !== null) {
      URLs.push(item[0])
    }
  })

  return URLs
}

async function exportDoc(exportFiles, exportFolder, posts, localhost) {

  // used to build final url path to access HTML file
  const exportURLfragment = process.env.EXPORT_FOLDER.split('/').slice(-1)[0]

  // build date string in a modified ISO8601 format => 2021-04-26T165536
  const date = new Date();
  const dateNow = date.toISOString().replace(/:/g, '').split('.')[0]

  // if there's already one or more file exported, 
  // do timestamp comparison b/t file mtime and chat last msg timestamp
  // in order to decide if exporting a newer version of the doc or not
  if (exportFiles.length > 0) {

    // get latest exported file 
    // and fetch stats (eg file modified timestamp => mtime)
    const exportFileLast = exportFiles[exportFiles.length -1]
    const exportFileStat = await fs.stat(path.resolve(exportFolder, exportFileLast))

    // get last chat msg
    const chatMsgLast = posts[posts.length -1]

    console.log(chatMsgLast.value.match(URLmatch) === null, 
      new Date(chatMsgLast.timestamp), '>', new Date(exportFileStat['mtime']), '=>', 
      new Date(chatMsgLast.timestamp) > new Date(exportFileStat['mtime']))

    // check if chat-last-msg contains one or more URLs,
    // and if chat-last-mgs timestamp is newer than chat-list.html export time
    if (chatMsgLast.value.match(URLmatch) !== null && new Date(chatMsgLast.timestamp) > new Date(exportFileStat['mtime'])) {

      await writeDocument(posts, dateNow)

      const documentURL = `${localhost}/${exportURLfragment}/${dateNow}`
      return documentURL

    } else {

      const documentURL = `${localhost}/${exportURLfragment}/${exportFileLast}`
      return documentURL

    }

  } else {
    // if there's no file exported yet, make a new one

    await writeDocument(posts, dateNow)

    const documentURL = `${localhost}/${exportURLfragment}/${dateNow}`
    return documentURL

  }
}

async function writeDocument(posts, dateNow) {
  const URLs = getURLfromPost(posts) 

  const chatLinksFile = nunjucks.render('chat-urls.html', {
    title: settings.title, 
    headline: settings.headline.replace(/\n/g, ' '),
    date: dateNow,
    urls: URLs
  });

  // write chat-links.html export file to disk
  try {
    await fs.writeFile(path.resolve(__dirname, `${process.env.EXPORT_FOLDER}/${dateNow}.html`), chatLinksFile)
  } catch (err) {
    throw err
  }

}

// -- start
initialize().then((stream) => {
  const listener = http.listen(process.env.PORT || 4000, function() {
    console.log('Your app is listening on port ' + listener.address().port)
    console.log('HERE ARE YOUR STREAM DETAILS, KEEP THEM SECRET!')
    console.log(`Stream Key: ${stream.stream_key}`)
  })
})
