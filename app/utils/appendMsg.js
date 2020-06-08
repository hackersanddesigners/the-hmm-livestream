const chatMsg = require('../components/chat-msg')

function appendMsg (el, msg) {
  const newMsg = chatMsg(msg)

  el.append(newMsg)
  newMsg.scrollIntoView(false) 
}

module.exports = appendMsg
