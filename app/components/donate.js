const html = require('choo/html')
const nc = require('nanocomponent')

class donate extends nc {
  constructor (state, emit) {
    super()

    this.state = null
    this.emit = null
  }

  createElement (state, emit) {
    this.state = state
    this.emit = emit

    const donations = {
      '3.00': '🍺: €3',
      '6.00': '🍻: €6',
      '9.00': '🍸: €9'
    }
    
    return html`
      <div>
        <button class="curp" onclick=${toggle(emit)}>Donate</button>
        <form onsubmit=${onsubmit} method="post" class="${state.components.donate.toggle ? 'x xdc pt1' : 'dn'}">
          <div class="x xdr pb1">
            ${donationList(donations)} 
          </div>

          <div class="bot psf t0 l-999">
            <label for="message">If you are not a bot, leave this field empty</label>
            <input type="text" name="website" id="website" placeholder ="http://example.com" value="">
          </div>

          <input type="submit" value="Send" class="curp donate-send">
        </form>
      </div>
    `

    function donationList (list) {
      return Object.keys(list).map(item => {
        return html`
          <div class="pr1">
            <input id="${item}" name="donation" type="radio" value="${item}" class="mr0-25">
            <label for="${item}">${list[item]}</label>
          </div>
        `
      })
    }

    function toggle (emit) {
      return () => { emit('donate-toggle') }
    }

    function onsubmit (e) {
      e.preventDefault()
      const form = e.currentTarget
      let data = new FormData(form)

      let body = {}
      for (let pair of data.entries()) body[pair[0]] = pair[1]

      const send = form.querySelector('.donate-send')

      if (body.website !== '') {
        return
      } else {
        const data = Object.keys(body).map(key => {
          if (key !== 'website') {
            return {
              amount: body[key],
              description: key
            }
          }
        })[0]
        console.log(data)
        ;
        (async () => {
          const response = await fetch('/donate', {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify(data)
          })

          if (response.ok) {
            const data = await response.json()
            return data
          } else {
            return response.error
          }
        })()
      }
    }
  }

  update () {
    return true
  }
}

module.exports = donate
