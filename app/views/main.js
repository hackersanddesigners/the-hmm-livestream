const html = require('choo/html')
const raw = require('choo/html/raw')
const VideoPlayer = require('../components/video-player')
const videoPlayer = new VideoPlayer()
const Chat = require('../components/chat')
const chat = new Chat()
const Donate = require('../components/donate')
const donate = new Donate()
const Ticker = require('../components/ticker')
const Viewers = require('../components/viewers')
const settings = require('../settings.json')
const viewers = new Viewers()

function view (state, emit) {
  console.log(state)

  return html`
    <body>
      <header>
        <figure class="psr oh tac pt1">
         <img src="/assets/logo.png" style="max-width: 100%; max-height: 6rem"> 
        </figure>
      </header>
      ${content(state, emit)} 
      <div class="x xdr xw xab xjb">
        ${donateButton(settings.donateButton)}
        ${viewers.render(state, emit, state.components.chat.userCount)}
      </div>
    </body>
  ` 

  function chatBox (state, emit) {
    const data = state.components.chat
    return html`
      <div class="psr w100 md-w-chat btlr bgc-bl fc-wh b-wh ${state.components.chat.toggle ? 'oys h-chat-open md-video-ar' : 'h-chat tac'}">
        <button onclick=${toggleBox(emit)} type="button" class="z2 ft-ms curp${state.components.chat.toggle ? ' psa t0 r0 pt0-25 pl0-5 pr1' : ' py1 w100'}">${state.components.chat.toggle ? ' x' : 'Chat'}</button>
        ${chat.render(state, emit, data)}
      </div>
    ` 
  }

  function donateButton (flag) {
    if (flag) {
      return donate.render(state, emit)
    }
  }

  function content (state, emit) {
    const video = state.components.video
    const tickerT = state.cache(Ticker, '00-t')
    const tickerB = state.cache(Ticker, '01-b')
    return html`
      <main class="x xdc">
        ${tickerT.render(state, emit, {string: settings.ticker.text, n: 15, side: 'top'})}
        <div class="psr x xdc md-xdr xafe w--full bgc-bk">
          <div class="z2 psa t0 l0 p0-5" style="color: ${settings.ticker.backgroundColour}">${video.stream !== null ? video.stream.status : '...'}</div>
          ${videoBlock(video)}
          ${chatBox(state, emit)}
        </div>
        ${tickerB.render(state, emit, {string: settings.ticker.text, n: 15, side: 'bottom'})} 
      </main>
    `
  }

  function toggleBox (emit) {
    return () => { emit('chat-toggle') }
  }

  function videoBlock (video) {
    if (video.stream !== null) {
      return html`
        <div class="psr w100 video-ar oh bgc-bk">
          ${videoWrapper(video)}
        </div>
      `
    } else {
      return html`
        <div class="psr w100 video-ar oh bgc-bk"></div>
      `
    }

    function videoWrapper (video) {
      if (video.stream.status === 'active') {
        return videoPlayer.render(state, emit, video)
      } else {
        return html`
          <div></div>
        `
      }
    }
  }

}

module.exports = view
