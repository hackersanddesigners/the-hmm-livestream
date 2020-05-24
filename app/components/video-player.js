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
      <div class="psa t0 l0 b0 r0 w100 bgc-bk">
        <button onclick=${muteToggle} class="${state.components.video.muted ? 'psa t0 l0 w100 h100 curp x xjc xac' : 'dn' }">
          <p class="z1 bgc-wh py1 px2 br1 bsh b-bk">unmute</p>
        </button>
        <video onplay=${onPlay(emit)} onpause=${onPause(emit)} ${data.controls ? 'controls' : ''} class="w100 h100 bgc-bk"> 
      </div>
    `

    function muteToggle (e) {
      e.preventDefault()

      state.components.video.muted = false
      e.currentTarget.nextSibling.muted = false
      e.currentTarget.classList.add('dn')
    }

    function onPlay(emit) {
      return () => {emit('ticker-toggle', 'play')}
    }

    function onPause(emit) {
      return () => {emit('ticker-toggle', 'pause')}
    }
  }

  load () {
    const video = this.element.querySelector('video')
    const stream = this.data.stream
    const videoSrc = `https://stream.mux.com/${stream.playbackId}.m3u8`

    if (Hls.isSupported()) {
      const hls = this.state.components.video.hls === null
            ? new Hls()
            : this.state.components.video.hls

      hls.loadSource(videoSrc)
      hls.attachMedia(video)

      video.muted = true
      video.play()

      this.state.components.video.hls = hls
      
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc
      video.muted = true
      video.play()
    }
  }

  update () {
    return true
  }

}

module.exports = videoPlayer
