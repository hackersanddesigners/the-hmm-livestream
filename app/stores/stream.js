const io = require('socket.io-client')
const socket = io()

function stream (state, emitter) {
  state.components.socket = socket
  state.components.video = {
    stream: null,
    controls: false,
    muted: true
  } 

  state.components.chat = {
    toggle: false,
    username: undefined,
    posts: [],
    userCount: 0
  }

  emitter.on('DOMContentLoaded', async() => {
    const stream = await fetch('/stream')
    if (stream.ok) {
      const data = await stream.json()
      state.components.video.stream = data
      emitter.emit('render')
    } else {
      return stream.status
    }

    const posts = await fetch('/posts')
    if (posts.ok) {
      const data = await posts.json()
      state.components.chat.posts = data
      emitter.emit('render')
    } else {
      return posts.status
    }
  })

  emitter.on('chat-toggle', () => {
    state.components.chat.toggle =! state.components.chat.toggle
    emitter.emit('render')
  })

  socket.on('chat-msg', (msg) => {
    console.log('chat-msg', msg)
    state.components.chat.posts.push(msg)
    emitter.emit('render')
  })

  socket.on('user-count', (count) => {
    console.log('user-count', count)
    state.components.chat.userCount = count
    emitter.emit('render')
  })

  // socket.on('stream_update', (stream) => {
  //   console.log('ss', stream)
  //   if (stream.status === 'idle') {
  //     console.log(stream, stream.status)
  //     state.components.video.stream = stream
  //     emitter.emit('render')
  //   }
  // })

  emitter.on('toggle-video', () => {
    console.log('hi!')
    state.components.video.controls =! state.components.video.controls
    state.components.video.muted =! state.components.video.muted
    emitter.emit('render')
  })

}

module.exports = stream
