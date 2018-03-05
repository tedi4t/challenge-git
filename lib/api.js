var ss = require('serialize-stream')
var pump = require('pump')
var body = require('body/json')
var send = require('send-data/json')

var Things = require('./models/things')

module.exports = {
  get: get,
  put: put,
  echo: echo,
  stream: stream
}

function get (req, res, opts, cb) {
  Things.get(opts.params.key, function (err, value) {
    if (err) return cb(err)

    send(req, res, value)
  })
}

function put (req, res, opts, cb) {
  body(req, res, function (err, data) {
    if (err) return cb(err)

    Things.put(opts.params.key, data, function (err) {
      if (err) return cb(err)

      send(req, res, data)
    })
  })
}

function echo (req, res, opts, cb) {
  send(req, res, opts.query)
}

function stream (req, res, opts, cb) {
  pump(
    Things.createValueStream({
      gte: opts.params.gte,
      lte: opts.params.lte
    }),
    ss(opts.query.format),
    res,
    cb
  )
}
