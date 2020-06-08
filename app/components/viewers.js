const html = require('choo/html')
const nc = require('nanocomponent')

class viewers extends nc {
  constructor (state, emit) {
    super()

    this.state = null
    this.emit = null
    this.count = ''
  }

  createElement (state, emit, count) {
    this.state = state
    this.emit = emit
    this.count = count

    return html`
      <p class="user-count p1 tar"><span>${count}</span> viewers</p>
    `
  }

  load () {
    this.n = 0
  }

  update () {
    return true
  }

}

module.exports = viewers
