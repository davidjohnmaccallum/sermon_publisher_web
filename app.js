const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const router = require('./routes')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', router)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).render('_404')
})

// error handler
app.use(function (err, req, res, next) {
  console.error(err)
  res.status(err.status || 500)
  if (req.app.get('env') === 'development') {
    res.render('error', {
      message: `${res.statusCode} ${err.message}`,
      err,
    })
  } else {
    res.render('error', {
      message: 'Apologies for the error.',
    })
  }
})

module.exports = app
