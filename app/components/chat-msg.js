const html = require('choo/html')
const formatDate = require('../utils/formatDate')
const raw = require('choo/html/raw')
const md = require('../utils/markdown')

function chatMsg (msg) {
  return html`
    <div class="x xdc xw pb1 ow">
      <time datetime="${formatDate(msg.timestamp).iso}" class="ft-ms fs0-8">${formatDate(msg.timestamp).date}</time>
      <div class="pl1 copy">
        <em>${msg.username}:</em>
        ${raw(md(msg.value))}
      </div>
    </div>
  ` 
}

module.exports = chatMsg
