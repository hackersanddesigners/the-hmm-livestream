const html = require('choo/html')
const raw = require('choo/html/raw')
const VideoPlayer = require('../components/video-player')
const videoPlayer = new VideoPlayer()
const Chat = require('../components/chat')
const chat = new Chat()
const Donate = require('../components/donate')
const donate = new Donate()
const Ticker = require('../components/ticker')

function view (state, emit) {
  console.log(state)

  return html`
    <body>
      <header>
        <figure class="psr oh" style="height: 6rem">
          <a href="https://thehmm.nl" class="db w100 h100 psa t0 l0 x xjc tac oh">
            <svg style="max-width: 90vw; height: 6rem; bottom: -.5rem;" data-name="Layer 1" viewBox="0 -100 5098.47 915.91"><defs><clipPath id="a" transform="translate(-14.72 -29.35)"><path fill="none" d="M13.47 28.1h5100.95v918.41H13.47z"/></clipPath></defs><g clip-path="url(#a)"><path d="M499.22 218.41h216.63v-188H7.5v188h217.78v674h273.94zm653.38 674h287.68v-510c0-135.25-75.64-204-189.12-204-136.39 0-188 99.71-188 99.71V7.5H775.51v884.86h287.69V375.43c0-21.77 13.75-37.82 44.7-37.82s44.7 16.05 44.7 37.82zm650-431V347.92c0-18.34 14.91-32.09 44.71-32.09s45.84 13.75 45.84 32.09v113.47zm377.1 199.44v-32.11h-286.59v107.74c0 18.34-16 32.09-45.84 32.09s-44.71-13.75-44.71-32.09V558.82h377.1V423.57c0-145.57-83.67-247.57-332.39-247.57s-331.25 102-331.25 247.57v237.26c0 145.57 82.53 247.58 331.25 247.58s332.39-102 332.39-247.58m761.5 231.53h273.94V30.43h-273.94v335.83h-161.61V30.43h-273.94v861.93h273.94v-337h161.61zm2149.77.46v-510c0-135.25-75.64-204-189.12-204-136.4 0-193.7 99.72-200.58 110-19.49-68.77-81.38-110-176.52-110-136.39 0-196 99.72-196 99.72l-6.76 10.85c-27.45-73.62-90.35-111-173.89-111-136.39 0-193.7 99.71-200.58 110-19.48-68.77-81.38-110-176.51-110-136.4 0-196 99.71-196 99.71l8-86h-287.69v700.26h287.69V375.43c0-21.77 13.75-37.82 44.7-37.82s44.7 16.05 44.7 37.82v516.93h287.69V370.84c1.15-19.48 16-33.23 44.7-33.23 30.95 0 44.7 16.05 44.7 37.82v516.93h287.69v-510c0-2.86-.22-5.51-.29-8.31.8-20.78 14.52-35.93 44.55-35.93 30.94 0 44.7 16.05 44.7 37.82v516.88h287.68V371.3c1.15-19.48 16.05-33.23 44.71-33.23 30.95 0 44.7 16.05 44.7 37.82v516.93z" fill="#fff"/><path d="M499.22 218.41h216.63v-188H7.5v188h217.78v674h273.94zm653.38 674h287.68v-510c0-135.25-75.64-204-189.12-204-136.39 0-188 99.71-188 99.71V7.5H775.51v884.86h287.69V375.43c0-21.77 13.75-37.82 44.7-37.82s44.7 16.05 44.7 37.82zm650-431V347.92c0-18.34 14.91-32.09 44.71-32.09s45.84 13.75 45.84 32.09v113.47zm377.1 199.44v-32.11h-286.59v107.74c0 18.34-16 32.09-45.84 32.09s-44.71-13.75-44.71-32.09V558.82h377.1V423.57c0-145.57-83.67-247.57-332.39-247.57s-331.25 102-331.25 247.57v237.26c0 145.57 82.53 247.58 331.25 247.58s332.39-102.01 332.39-247.58zm761.5 231.53h273.94V30.43h-273.98v335.83h-161.61V30.43h-273.94v861.93h273.94v-337h161.61zm2149.77.46v-510c0-135.25-75.64-204-189.12-204-136.4 0-193.7 99.72-200.58 110-19.49-68.77-81.38-110-176.52-110-136.39 0-196 99.72-196 99.72l-6.76 10.85c-27.45-73.62-90.35-111-173.89-111-136.39 0-193.7 99.71-200.58 110-19.48-68.77-81.38-110-176.51-110-136.4 0-196 99.71-196 99.71l8-86h-287.73v700.24h287.69V375.43c0-21.77 13.75-37.82 44.7-37.82s44.7 16.05 44.7 37.82v516.93h287.69V370.84c1.15-19.48 16-33.23 44.7-33.23 30.95 0 44.7 16.05 44.7 37.82v516.93h287.69v-510c0-2.86-.22-5.51-.29-8.31.8-20.78 14.52-35.93 44.55-35.93 30.94 0 44.7 16.05 44.7 37.82v516.88h287.68V371.3c1.15-19.48 16.05-33.23 44.71-33.23 30.95 0 44.7 16.05 44.7 37.82v516.93z" stroke="#231f20" stroke-width="15" fill="none"/></g></svg>
          </a>
        </figure>
      </header>
      ${content(state, emit)} 
      <footer class="p1 x xdr xw xjb">
         ${donate.render(state, emit)}
         ${viewers(state, emit)}
       </div>
    </body>
  ` 

  function chatBox (state, emit) {
    return html`
      <div class="c4 psa b0 r0 btlr bgc-bl fc-wh b-wh ${state.components.chat.toggle ? ' h100 oys' : 'tac'}">
        <button onclick=${toggleBox(emit)} type="button" class="ft-ms curp${state.components.chat.toggle ? ' psa t0 r0 pt0-25 px0-5' : ' py1 w100'}">${state.components.chat.toggle ? ' x' : 'Chat'}</button>
        ${chat.render(state, emit, {})}
      </div>
    ` 
  }

  function viewers (state, emit) {
    const count = state.components.chat.userCount
    return html`
      <p>${count} viewers</p>
    `
  }

  function content (state, emit) {
    const video = state.components.video
    const tickerT = state.cache(Ticker, '00-t')
    const tickerB = state.cache(Ticker, '01-b')
    return html`
      <main class="x xdc">
        ${tickerT.render(state, emit, {string: 'The Hmm @ Hackers & Designers', n: 15, side: 'top'})}
        <div class="w--full bgc-bk">
          <div style="max-width: 39rem; margin: 0 auto;">
            ${videoBlock(video)}
          </div>
        </div>
        ${tickerB.render(state, emit, {string: 'The Hmm @ Hackers & Designers', n: 15, side: 'bottom'})} 
      </main>
    `
  }

  function toggleBox (emit) {
    return () => { emit('chat-toggle') }
  }

  function videoBlock (video) {
    if (video.stream !== null) {
      return html`
        <div class="psr video-ar bgc-bk">
          <div class="z2 psa t0 l0 bgc-wh p0-15">status: ${video.stream.status}</div>
          ${videoWrapper(video)}
        </div>
      `
    } else {
      return html`
        <div class="psr video-ar bgc-bk">
          <div class="psa t0 l0 bgc-wh p0-15">status: ...</div> 
        </div>
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
