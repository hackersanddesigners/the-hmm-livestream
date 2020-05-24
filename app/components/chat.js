const html = require('choo/html')
const nc = require('nanocomponent')

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
      <div class="${state.components.chat.toggle ? 'x xdc h100' : 'dn'}">
        ${storage()}
        <div style="max-height: 20.5rem" class="chat-wrap p0-5 oys">
          <div class="p0-5 chat-list">${msgList(state.components.chat.posts)}</div>
        </div>

        <form onsubmit=${onsubmit} method="post" class="p0-5 bt-wh bgc-bl">
          ${setUsername(state)}
          <input required class="message w100" type="text" placeholder="Type here to send a message">
          <input class="psf t0 l-999" type="submit" value="Send">
        </form>
      </div>
    `

    function setUsername (state) {
      if (state.components.chat.username === undefined) {
        return html`
          <input required class="username" type="text" placeholder="Pick a username">
        `
      }
    }

    function formatDate(ts) {
      const t = new Date(ts).toLocaleString('nl-NL')
      const tsp = t.split(' ')
      const dt_sp = tsp[0].split('-')
      const tt_sp = tsp[1].split(':')

      const date = `${dt_sp[2]}.${dt_sp[1]}.${dt_sp[0]} ${tt_sp[0]}:${tt_sp[1]}`
      const iso = `${dt_sp[2]}.${dt_sp[1]}.${dt_sp[0]}T${tt_sp[0]}:${tt_sp[1]}`

      return {
        iso: iso,
        date: date
      }
    }

    function msgList (data) {
      if (data.length > 0) {
        return data.map(msg => {
          return html`
            <div class="x xdc xw pb1">
              <time datetime="${formatDate(msg.timestamp).iso}" class="ft-ms fs0-8">${formatDate(msg.timestamp).date}</time>
              <p class="pl1">${msg.username}: ${msg.value}</p>
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

      const input_username = form.querySelector('.username')
      const input_message = form.querySelector('.message')

      let username = localStorage.getItem('username')
      
      if (input_username !== null) {
        localStorage.setItem('username', input_username.value)
        state.components.chat.username = input_username.value
      } else {
        state.components.chat.username = username
      }

      const msg = {
        timestamp: new Date(),
        username: state.components.chat.username,
        value: input_message.value
      }

      state.components.socket.emit('chat-msg', msg)
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
