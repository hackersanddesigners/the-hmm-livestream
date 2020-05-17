require('dotenv').config()
const fs = require('fs').promises
const path = require('path')
const express = require('express')
const basicAuth = require('basic-auth')
const app = express()
const Mux = require('@mux/mux-node')
const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET)
let STREAM
const db = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const http = require('http').Server(app)
const socket = require('socket.io')(http)
const { createMollieClient } = require('@mollie/api-client');
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE });

// serve index.html with choo app
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'))
})

app.use('/assets', express.static(path.resolve(__dirname, 'assets')))

app.use(express.json())

// storage configuration
const stateFilePath = './.data/stream'

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
    test: true,
    playback_policy: 'public',
    reconnect_window: 10,
    new_asset_settings: { playback_policy: 'public' } 
  })
}

// reads a state file looking for an existing live stream, if it can't find one, 
// creates a new one, saving the new live stream to our state file and global stream variable.
const initialize = async () => {
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
      const posts = db.get('posts')
      res.send(posts)
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

// -- /stream, bootstrap the live-stream
app.get('/stream', async (req, res) => {
  const stream = await Video.LiveStreams.get(STREAM.id)
  res.json(
    publicStreamDetails(stream)
  )
})

// -- mux-hook, listen to mux callbacks
// auth, 
app.post('/mux-hook', function (req, res) {
  console.log('mux-hook =>', req.body)
  STREAM.status = req.body.data.status
  
  if (req.body.type === 'video.live_stream.idle' || req.body.type === 'video.live_stream.active') {
    socket.emit('stream-update', publicStreamDetails(STREAM))
  }

  res.sendStatus(200)
})

app.post('/donate', async (req, res) => {
  let data = req.body
  console.log('data =>', data)
  ;
  (async () => {
    try {
      const payment = await mollieClient.payments.create({
        amount: {
          currency: 'EUR',
          value: data.amount, // We enforce the correct number of decimals through strings
        },
        description: data.description,
        redirectUrl: 'https://live.hackersanddesigners.nl',
        // webhookUrl: 'https://live.hackersanddesigners.nl/donate/webhook/',
      })
      payment.getCheckoutUrl()
      console.log(payment)
      res.send(payment)
    } catch (error) {
      console.warn(error)
      res.send(error)
    }
  })();
})


// -- start
initialize().then((stream) => {
  const listener = http.listen(process.env.PORT || 4000, function() {
    console.log('Your app is listening on port ' + listener.address().port)
    console.log('HERE ARE YOUR STREAM DETAILS, KEEP THEM SECRET!')
    console.log(`Stream Key: ${stream.stream_key}`)
  })
})
