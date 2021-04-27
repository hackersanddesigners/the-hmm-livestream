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

    const isChatMessageVisible = sessionStorage.getItem('username') !== null ? '' : 'dn '

    return html`
      <div class="${data.toggle ? 'x xdc h100' : 'dn'}">
        ${storage()}
        ${chatView(data)}
        ${inputForm(data.view, isChatMessageVisible)}
        <button type="button" onclick=${chatViewToggle(emit)} class="curp fs0-8 x xdr xafe pt0-5 pr1 pb0-5 pl0-5 bt-wh bgc-bl">${data.view ? 'Show chat' : 'Show only URLs'}</button>
      </div>
    `

    function inputForm (chatView, isChatMessageVisible) {
      if (chatView === false) {
        return html`
          <form onsubmit=${onsubmit} method="post" class="x xdc bt-wh bgc-bl mba">
            ${inputUsername(sessionStorage.getItem('username'))}
            <label class="${isChatMessageVisible}" for="chat-message"></label>
            <textarea id="chat-message" name="chat-message" required onkeydown=${onsubmit} class="message ${isChatMessageVisible}w100 bgc-db px0-5 py0-25" style="resize:vertical" type="text" placeholder="Type here to send a message, then press Enter"></textarea>
            <input class="curp pl0-5 dn md-psf md-t0 md-l-999" type="submit" value="Send">
          </form>
        `
      }
    }

    function chatView (data) {
      if (data.view) {
        return html`
          <div class="chat-wrap ${sessionStorage.getItem('username') !== null ? 'h-chat-sg' : 'h-chat-db'} pt0-5 pr1 mba pl0-5 oys copy ow">
            <p class="pt1">List of shared URLs from the chat:</p>
            <ul class="url-list oxh">${urlList(data.urls)}</ul>
            ${downloadButton(data.urls, data.download)}
          </div>
        `
      } else {
        return html`
          <div class="chat-wrap ${sessionStorage.getItem('username') !== null ? 'h-chat-sg' : 'h-chat-db'} pt0-5 pr1 mba pl0-5 oys">
            <div class="chat-list oxh">${msgList(data.posts)}</div>
          </div>
        `
      }

      function downloadButton (urls, download) {
        if (urls.length > 0 && download !== '') {
          return html`
            <a href="${download}" download="" target="_blank" class="db pb1">Download as HTML file</a>
          `
        }
      }
    }

    function inputUsername (username) {
      if (username === null) {
        return html`
          <input required class="username bgc-db p0-25" type="text" placeholder="Pick a username" onkeydown=${setUsername}>
        `
      }
    }

    function setUsername (e) {
      // run this only if Enter is pressed
      console.log('aa =>', e)
      if (e.which === 13) {
        e.preventDefault()

        const input_username = e.target.value

        let username = ''
        if (input_username !== '') {
          username = input_username
          sessionStorage.setItem('username', input_username)
        } else if (sessionStorage.getItem('username') !== null) {
          username = sessionStorage.getItem('username')
        }

        emit('chat-set-username', username)
      }
    }

    function msgList (data) {
      if (data.length > 0) {
        return data.map(msg => {
          return chatMsg(msg)
        })
      } else {
        return html`
          <div><p class="pt1">No message yet.</p></div>
        `
      }
    }

    function urlList (data) {
      if (data.length > 0) {
        return data.map(url => {
          return html`
            <li><a href="${url}" target="_blank">${url}</a></li>
          `
        })
      } else {
        return html`
          <p>No URL has been shared yet.</p>
        `
      }
    }

    function onsubmit (e) {
      // run this only if Enter is pressed
      if (e.which === 13 && !e.shiftKey) {
        e.preventDefault()
      
        const form = e.target.form

        const input_message = form.querySelector('.message')
        const username = sessionStorage.getItem('username')

        const msg = {
          timestamp: new Date(),
          username: username,
          value: input_message.value
        }

        // send msg to db + append it to chat w/o app re-render
        state.components.socket.emit('chat-msg', msg)

        // clear input-message
        input_message.value = '' 

        // set correct chat-list height
        const chatList = e.originalTarget.previousElementSibling
        chatList.classList.remove('h-chat-db')
        chatList.classList.add('h-chat-sg')
      }
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

    function chatViewToggle (emit) {
      return () => {
        emit('chat-view-toggle')
      }
    }

  }

  load (el) {
    if (this.state.components.chat.view === false) {
      const chatWrap = el.querySelector('.chat-wrap')
    }
  }

  update () {
    return true
  }

  afterupdate(el) {
    if (this.state.components.chat.view === false) {
      const chatList = el.querySelector('.chat-list')
      chatList.scrollIntoView(false)
    }
  }
}

module.exports = chat
