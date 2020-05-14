require('dotenv').config()
const fs = require('fs').promises
const express = require('express')
const bodyParser = require('body-parser')
const basicAuth = require('basic-auth')
const app = express()
const Mux = require('@mux/mux-node')
const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET)
let STREAM
const db = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

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
      return res.send(401)
  }
  const user = basicAuth(req)
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
    io.on('connection', (socket) => {
      console.log('a user connected')

      socket.on('disconnect', () => {
        console.log('user disconnected')
      })

      socket.on('chat-msg', (msg) => {
        console.log('msg', msg)
        io.emit('chat-msg', msg)

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
app.post('/mux-hook', auth, function (req, res) {
  STREAM.status = req.body.data.status
  
  switch (req.body.type) {
  case 'video.live_stream.idle':
    io.emit('stream_update', publicStreamDetails(STREAM))

    // when a live stream is active or idle, we want to push a new event down our
    // web socket connection to our frontend, so that it update and display or hide
    // the live stream.
  case 'video.live_stream.active':
    io.emit('stream_update', publicStreamDetails(STREAM))
    break
  default:
  }

  res.status(200).send('mux-hook, working')
})

// -- start
initialize().then((stream) => {
  const listener = http.listen(process.env.PORT || 4000, function() {
    console.log('Your app is listening on port ' + listener.address().port)
    console.log('HERE ARE YOUR STREAM DETAILS, KEEP THEM SECRET!')
    console.log(`Stream Key: ${stream.stream_key}`)
  })
})
