const html = require('choo/html')
const nc = require('nanocomponent')
const Smarquee = require('smarquee')

class ticker extends nc {
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

    const filler = Array.from(Array(data.n).fill(data.string))
    const fillText = filler.map(text => html`<span class="dbi pr0-15">${text}</span>`)

    return html`
      <div id="smarquee-${data.side}" class="z1 py0-25 bgc-yl ${data.side === 'top' ? 'bsh-t' : 'bsh-b' }">
        ${fillText}
      </div>
    `
  }

  load (el) {
    let smarquee = new Smarquee({
      selector: `#smarquee-${this.data.side}`,
      styleOptions: {
        scrollingTitleMargin: 0,
        animationName: 'marquee',
        timingFunction: 'linear',
        iterationCount: 'infinite',
        fillMode: 'none',
        playState: 'running',
        delay: '0',
        pausePercent: 0
      },
    })
    smarquee.init()
    this.state.components.ticker.push(smarquee) 
  }

  update () {
    return false
  }
}

module.exports = ticker
