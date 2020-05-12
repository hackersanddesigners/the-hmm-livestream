const html = require('choo/html')
const raw = require('choo/html/raw')
const VideoPlayer = require('../components/video-player')
const videoPlayer = new VideoPlayer()
const Chat = require('../components/chat')
const chat = new Chat()

function view (state, emit) {
  console.log(state)

  return html`
    <body>
      <h1>moving bodies</h1>
      ${content(state, emit)} 
    </body>
  `

  function content (state, emit) {
    if (state.components.video.stream !== null) {
      const video = state.components.video
      return html`
        <main>
          <div>
            <p>${video.stream.status || 'status...'}</p>
            ${videoPlayer.render(state, emit, video)}
          </div>
          ${chat.render(state, emit, {})}
        </main>
      `
    }
  }

}

module.exports = view
