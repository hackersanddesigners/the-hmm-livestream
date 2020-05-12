const html = require('choo/html')
const nc = require('nanocomponent')
const Hls = require('hls.js')

class videoPlayer extends nc {
  constructor (state, emit) {
    super()

    this.state = null
    this.emit = null
    this.data = {}
  }

  createElement (state, emit, data) {
    this.state = state
    this.emit = emit
    this.data = data

    console.log('data =>', data)

    const srcUrl = `https://stream.mux.com/${data.stream.playbackId}.m3u8`

    return html`
      <video style="border: 1px solid red; background-color: black" src=${srcUrl} controls=${state.components.video.controls} muted=${state.components.video.muted} id="video"> 
    `
  }

  load (el) {
    if (this.state.components.video.stream !== null) {
      const video = el
      const stream = this.state.components.video.stream
      const srcUrl = `https://stream.mux.com/${stream.playbackId}.m3u8`

      console.log(video)

      // if hls.js is supported on this platform
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(srcUrl)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.controls = true
          video.play()
        });
        
        // if the player can support hls natively
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = srcUrl
        video.addEventListener('loadedmetadata', () => {
          video.controls = true
          video.play()
        });
      }
    }
  }

  update () {
    return true
  }
}

module.exports = videoPlayer
