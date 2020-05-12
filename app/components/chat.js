const html = require('choo/html')
const nc = require('nanocomponent')
const io = require('socket.io-client')
const socket = io()

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
      <div>
        ${storage()}
        <h3>chat</h3>
        <div style="border: 1px solid blue">${msgList(state.components.chat.msgList)}</div>
        <form onsubmit=${onsubmit} method="post">
          <label>Pick a username</label><input class="username" type="text">
          <input class="msg" type="text">
          <input type="submit" value="Send" class="send fs1 tdu curp">
        </form>
      </div> 
    `

    function msgList (data) {
      if (data.length > 0) {
        return data.map(msg => {
          return html`
            <div>
              <p>${msg.timestamp} ${msg.username}</p>
              <p>${msg.value}</p>
            </div>
          `
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

      if (form[0].value !== '') { 
      let username = JSON.parse(localStorage.getItem('username'))
      if (username !== null) {
        localStorage.removeItem('username') 
      } else {
        localStorage.setItem('username', JSON.stringify(form[0].value))
        state.components.login = user
      }

      const msg = {
        timestamp: new Date(),
        username: form[0].value,
        value: form[1].value
      }

      socket.emit('chat-msg', msg)
      form[0].value = ''
      form[1].value = ''
      return false
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
        console.log('yes! we can use localstorage')
      } else {
        console.log('no localStorage')
      }
    }

  }

  update () {
    return true
  }
}

module.exports = chat
