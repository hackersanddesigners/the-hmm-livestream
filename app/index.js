const choo = require('choo')
const devtools = require('choo-devtools')
const css = require('sheetify')

const app = choo()
app.use(devtools())

app.use(require('./stores/stream'))
// app.use(require('./stores/click'))

app.route('/', require('./views/main'))
app.route('*', require('./views/notfound'))

if (!module.parent) app.mount('body')
else module.exports = app
