const choo = require('choo')
const devtools = require('choo-devtools')
const css = require('sheetify')
css('./design/index.js')
css('./design/design.css')

const app = choo()
app.use(devtools())

app.use(require('./stores/stream'))

app.route('/', require('./views/main'))
app.route('/checkout', require('./views/checkout'))
app.route('*', require('./views/notfound'))

if (!module.parent) app.mount('body')
else module.exports = app
