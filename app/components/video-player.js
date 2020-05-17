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
    
    return html`
      <video controls=${data.controls} class="psa t0 l0 b0 r0 w100 bgc-bk"> 
    `
  }

  load () {
    const video = this.element
    const stream = this.data.stream
    const videoSrc = `https://stream.mux.com/${stream.playbackId}.m3u8`

    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(videoSrc)
      hls.attachMedia(video)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc
    }
  }

  update () {
    return true
  }

}

module.exports = videoPlayer
