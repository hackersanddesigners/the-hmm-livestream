const html = require('choo/html')

function view (state, emit) {
  return html`
    <body>
      <p>Page not found!</p>
    </body>
  `
}

module.exports = view
