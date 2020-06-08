const html = require('choo/html')
const nc = require('nanocomponent')
const raw = require('choo/html/raw')
const md = require('markdown-it')({
  breaks: true,
  typographer: true,
  linkify: true
})
const chatMsg = require('./chat-msg')
const formatDate = require('../utils/formatDate')

class chat extends nc {
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
      <div class="${data.toggle ? 'x xdc h100' : 'dn'}">
        ${storage()}
        <div class="chat-wrap ${sessionStorage.getItem('username') !== null ? 'h-chat-sg' : 'h-chat-db'} p0-5 oys">
          <div class="p0-5 chat-list">${msgList(data.posts)}</div>
        </div>
        <form onsubmit=${onsubmit} method="post" class="p0-5 bt-wh bgc-bl">
          ${setUsername(sessionStorage.getItem('username'))}
          <input required class="message w100" type="text" placeholder="Type here to send a message">
          <input class="psf t0 l-999" type="submit" value="Send">
        </form>
      </div>
    `

    function setUsername (username) {
      if (username === null) {
        return html`
          <input required class="username" type="text" placeholder="Pick a username">
        `
      }
    } 

    function msgList (data) {
      if (data.length > 0) {
        return data.map(msg => {
          return chatMsg(msg)
        })
      } else {
        return html`
          <div><p>no message yet</p></div>
        `
      }
    }

    function onsubmit (e) {
      e.preventDefault()
      const form = e.currentTarget

      const input_username = form.querySelector('.username')
      const input_message = form.querySelector('.message')

      let username = ''
      console.log('input-username', input_username)
      if (input_username !== null) {
        username = input_username.value
        sessionStorage.setItem('username', input_username.value)
      } else if (sessionStorage.getItem('username') !== null) {
        username = sessionStorage.getItem('username')
      }

      const msg = {
        timestamp: new Date(),
        username: username,
        value: input_message.value
      }

      // send msg to db + append it w/o app re-render
      state.components.socket.emit('chat-msg', msg)

      // hide input-username
      if (input_username !== null) {
        input_username.classList.add('dn')
      }

      // clear input-message
      input_message.value = ''

      // set correct chat-list height
      const chatList = e.originalTarget.previousElementSibling
      chatList.classList.remove('h-chat-db')
      chatList.classList.add('h-chat-sg')
      console.log('chatList =>', chatList)
    }

    function storageAvailable (type) {
      try {
        let storage = window[type]
        let x = '__storage_test__'
        storage.setItem(x, x)
        storage.removeItem(x)
        return true
      } catch (e) {
        return e instanceof DOMException && (
          // everything except Firefox
          e.code === 22 ||
            // Firefox
          e.code === 1014 ||
            // test name field too, because code might not be present
          // everything except Firefox
          e.name === 'QuotaExceededError' ||
            // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
          // acknowledge QuotaExceededError only if there's something already stored
        storage.length !== 0
      }
    }

    function storage () {
      if (storageAvailable('localStorage')) {
        // console.log('yes! we can use localstorage')
      } else {
        // console.log('no localStorage')
      }
    }

  }

  load (el) {
    const chatWrap = el.querySelector('.chat-wrap')
  }

  update () {
    return true
  }

  afterupdate(el) {
    const chatList = el.querySelector('.chat-list')
    chatList.scrollIntoView(false)
  }
}

module.exports = chat
