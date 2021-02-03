'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var vfile = require('to-vfile')
var unified = require('unified')
var remark = require('remark')
var not = require('not')
var hidden = require('is-hidden')
var stringWidth = require('string-width')
var gfm = require('..')

test('gfm()', function (t) {
  t.doesNotThrow(function () {
    remark().use(gfm).freeze()
  }, 'should not throw if not passed options')

  t.doesNotThrow(function () {
    unified().use(gfm).freeze()
  }, 'should not throw if without parser or compiler')

  t.end()
})

test('fixtures', function (t) {
  var base = path.join(__dirname, 'fixtures')
  var entries = fs.readdirSync(base).filter(not(hidden))

  t.plan(entries.length)

  entries.forEach((fixture) => {
    t.test(fixture, function (st) {
      var file = vfile.readSync(path.join(base, fixture, 'input.md'))
      var input = String(file.contents)
      var outputPath = path.join(base, fixture, 'output.md')
      var treePath = path.join(base, fixture, 'tree.json')
      var configPath = path.join(base, fixture, 'config.json')
      var config
      var proc
      var actual
      var output
      var expected

      try {
        config = JSON.parse(fs.readFileSync(configPath))
      } catch (_) {}

      if (fixture === 'table-string-length') {
        config = {stringLength: stringWidth}
      }

      proc = remark().use(gfm, config).freeze()
      actual = proc.parse(file)

      try {
        expected = JSON.parse(fs.readFileSync(treePath))
      } catch (_) {
        // New fixture.
        fs.writeFileSync(treePath, JSON.stringify(actual, 0, 2) + '\n')
        expected = actual
      }

      try {
        output = fs.readFileSync(outputPath, 'utf8')
      } catch (_) {
        output = input
      }

      st.deepEqual(actual, expected, 'tree')
      st.equal(String(proc.processSync(file)), output, 'process')

      st.end()
    })
  })
})
