const io = require('socket.io-client')
const socket = io()
const appendMsg = require('../utils/appendMsg')

function stream (state, emitter) {
  state.components.socket = socket

  state.components.video = {
    stream: null,
    controls: false,
    muted: true,
    hls: null
  } 

  state.components.ticker = []

  state.components.chat = {
    toggle: false,
    username: undefined,
    posts: [],
    urls: [],
    download: '',
    userCount: 0,
    view: false
  }

  state.components.donate = {
    toggle: false
  }

  emitter.on('DOMContentLoaded', async() => {
    const stream = await fetch('/stream')
    if (stream.ok) {
      const data = await stream.json()
      state.components.video.stream = data

      if (data.status === 'active') {
        state.components.video.controls = true
      }
      
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

    const urls = await fetch('/posts/url')
    if (urls.ok) {
      const data = await urls.json()
      state.components.chat.urls = data
      emitter.emit('render')
    } else {
      return urls.status
    }
  })

  emitter.on('chat-toggle', () => {
    state.components.chat.toggle =! state.components.chat.toggle
    emitter.emit('render')
  })

  emitter.on('chat-set-username', (username) => {
    state.components.chat.username = username
    emitter.emit('render')
  })

  socket.on('chat-msg', (msg) => {
    state.components.chat.posts.push(msg)
    const chatList = document.querySelector('.chat-list')
    appendMsg(chatList, msg)

    // update URL list too
    const URLmatch = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+")
    const postURL = msg.value.match(URLmatch)

    if (postURL !== null) {
      state.components.chat.url.push(postURL)
    }
  })

  emitter.on('chat-view-toggle', async() => {
    // false => show normal chat (msg)
    // true => show URLs

    // fetch download file URL
    const downloadURL = await fetch('/api/get-chat-urls')
    if (downloadURL.ok) {
      const data = await downloadURL.json()
      state.components.chat.download = data.url
    } else {
      return downloadURL.status
    }

    state.components.chat.view =! state.components.chat.view
    emitter.emit('render')
  })

  socket.on('user-count', (count) => {
    state.components.chat.userCount = count
    document.querySelector('.user-count > span').innerText = count
  })

  socket.on('stream-update', (stream) => {
    state.components.video.controls =! state.components.video.controls
    state.components.video.stream = stream
    emitter.emit('render')
  })

  emitter.on('toggle-video', () => {
    state.components.video.controls =! state.components.video.controls
    state.components.video.muted =! state.components.video.muted
    emitter.emit('render')
  })

  emitter.on('video-mute-toggle', () => {
    state.components.video.muted =! state.components.video.muted
    emitter.emit('render')
  })

  emitter.on('donate-toggle', () => {
    state.components.donate.toggle =! state.components.donate.toggle
    emitter.emit('render')
  })

  emitter.on('donate', async(data) => {
    const response = await fetch('/donate', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      referrer: 'no-referrer',
      body: JSON.stringify(data)
    })

    if (response.ok) {
      const data = await response.json()

      // open new window to checkout-url
      window.open(data._links.checkout.href, '_blank')
      // window.location.replace(data._links.checkout.href)
    } else {
      return response.error
    }

    emitter.emit('render')
  })

  emitter.on('ticker-toggle', (action) => {
    state.components.ticker.forEach(ticker => {
      if (action === 'play') {
        ticker.pause()
        emitter.emit('render')
      } else if (action === 'pause') {
        ticker.play()
        emitter.emit('render')
      }
    })
  })

}

module.exports = stream
