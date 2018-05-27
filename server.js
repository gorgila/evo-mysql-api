var express = require('express')
var compression = require('compression')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

require('./server/models/admin')
require('./server/models/user')
require('./server/models/category')

var routes = require('./server/routes/index')

var app = express()

app.set('views', path.join(__dirname, 'dist'))
app.engine('.html', require('ejs').__express)
app.set('view engine', 'ejs')

app.use(compression())
app.use(favicon(path.join(__dirname, 'dist') + '/favicon.ico'))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'dist')))

app.use('/api', routes)

app.get('*', (req, res) => {
    res.json({
        code: -200,
        message: 'Page Not Found !!!'
    })
})

app.use(function(req, res, next) {
    var err = new Error('Not found!!!')
    err.status = 404
    next(err)
})

app.use(function(err, req, res) {
    res.status(err.status || 500)
    res.send(err.message)
})

var port = 2048
app.listen(port, function(err) {
    if (err) {
        console.log(err)
        return
    }
    console.log('Listening at http://localhost:' + port + '\n')
})