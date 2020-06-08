const html = require('choo/html')
const formatDate = require('../utils/formatDate')
const raw = require('choo/html/raw')
const md = require('markdown-it')({
  breaks: true,
  typographer: true,
  linkify: true
})

function chatMsg (msg) {
  return html`
    <div class="x xdc xw pb1 ow">
      <time datetime="${formatDate(msg.timestamp).iso}" class="ft-ms fs0-8">${formatDate(msg.timestamp).date}</time>
      <div class="pl1">
        <span>${msg.username}:</span>
        ${raw(md.render(msg.value))}
      </div>
    </div>
  ` 
}

module.exports = chatMsg
