process.env.NODE_ENV = 'test'

var tape = require('tape')
var split = require('split2')
var servertest = require('servertest')

var server = require('../lib/server')
var Things = require('../lib/models/things')

tape('healthcheck', function (t) {
  var url = '/health'
  servertest(server(), url, {encoding: 'json'}, function (err, res) {
    t.ifError(err, 'no error')

    t.equal(res.statusCode, 200, 'correct statusCode')
    t.equal(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})

tape('not found', function (t) {
  var url = '/404'
  servertest(server(), url, {encoding: 'json'}, function (err, res) {
    t.ifError(err, 'no error')

    t.equal(res.statusCode, 404, 'correct statusCode')
    t.equal(res.body.error, 'Resource Not Found', 'error match')
    t.end()
  })
})

tape('should get value', function (t) {
  var val = {some: 'test object'}
  Things.put('test-key', val, function (err) {
    t.ifError(err, 'no error')
    var url = '/things/get/test-key'
    servertest(server(), url, {encoding: 'json'}, function (err, res) {
      t.ifError(err, 'no error')

      t.equal(res.statusCode, 200, 'correct statusCode')
      t.deepEqual(res.body, val, 'values should match')
      t.end()
    })
  })
})

tape('should put values', function (t) {
  var url = '/things/put/test-key2'
  var opts = { method: 'POST', encoding: 'json' }
  var val = {some: 'other test object'}

  servertest(server(), url, opts, onResponse)
    .end(JSON.stringify(val))

  function onResponse (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 200, 'correct statusCode')

    Things.get('test-key2', function (err, doc) {
      t.ifError(err, 'no error')
      t.deepEqual(doc, val)
      t.end()
    })
  }
})

tape('should get stream', function (t) {
  var url = '/things/stream/test-key/test-key3?format=ndjson'

  var expected = [
    { some: 'test object' },
    { some: 'other test object' }
  ]

  var lines = []

  servertest(server(), url)
    .pipe(split())
    .on('error', function (err) { t.ifError(err, 'no error') })
    .on('data', function (line) { lines.push(JSON.parse(line)) })
    .on('end', function () {
      t.deepEqual(lines, expected, 'response should match')
      t.end()
    })
})

tape('should get echo', function (t) {
  var url = '/echo?one=1&two=2'
  servertest(server(), url, {encoding: 'json'}, function (err, res) {
    t.ifError(err, 'no error')

    t.equal(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, {one: '1', two: '2'}, 'values should match')
    t.end()
  })
})

tape('should get reverse', function (t) {
  var expected = {
    input: 'stringtoreverse',
    output: 'esreverotgnirts'
  }

  var url = '/reverse/' + expected.input
  servertest(server(), url, {encoding: 'json'}, function (err, res) {
    t.ifError(err, 'no error')

    t.equal(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, expected, 'values should match')
    t.end()
  })
})
