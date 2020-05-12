const io = require('socket.io-client')
const socket = io()

function stream (state, emitter) {
  state.components.video = {
    stream: null,
    controls: false,
    muted: true
  } 

  state.components.chat = {
    msgList: []
  }

  // console.log('socket =>', socket)

  emitter.on('DOMContentLoaded', async() => {
    const response = await fetch('/stream')
    if (response.ok) {
      const data = await response.json()
      state.components.video.stream = data
      emitter.emit('render')
    } else {
      return response.status
    }
  })

  socket.on('chat-msg', (msg) => {
    state.components.chat.msgList.push(msg)
    emitter.emit('render')
  })

  socket.on('stream_update', (stream) => {
    console.log('ss', stream)
    if (stream.status === 'idle') {
      console.log(stream, stream.status)
      state.components.video.stream = stream
      emitter.emit('render')
    }
  })

  emitter.on('toggle-video', () => {
    console.log('hi!')
    state.components.video.controls =! state.components.video.controls
    state.components.video.muted =! state.components.video.muted
    emitter.emit('render')
  })

}

module.exports = stream
