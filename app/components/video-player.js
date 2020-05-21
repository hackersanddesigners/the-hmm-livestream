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
      <video onplay=${onPlay(emit)} onpause=${onPause(emit)} ${data.controls ? 'controls' : ''} class="psa t0 l0 b0 r0 w100 bgc-bk"> 
    `

    function onPlay(emit) {
      return () => {emit('ticker-toggle', 'play')}
    }

    function onPause(emit) {
      return () => {emit('ticker-toggle', 'pause')}
    }
  }

  load () {
    const video = this.element
    const stream = this.data.stream
    const videoSrc = `https://stream.mux.com/${stream.playbackId}.m3u8`

    console.log('video-load =>', stream, videoSrc)

    if (Hls.isSupported()) {
      const hls = this.state.components.video.hls === null
            ? new Hls()
            : this.state.components.video.hls

      hls.loadSource(videoSrc)
      hls.attachMedia(video)

      this.state.components.video.hls = hls
      
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc
    }
  }

  update () {
    return true
  }

}

module.exports = videoPlayer
