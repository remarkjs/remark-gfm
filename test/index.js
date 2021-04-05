'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var vfile = require('to-vfile')
var unified = require('unified')
var remark = require('remark')
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
  var entries = fs.readdirSync(base)
  var index = -1
  var file
  var input
  var treePath
  var config
  var proc
  var output
  var actual
  var expected

  while (++index < entries.length) {
    if (hidden(entries[index])) continue

    file = vfile.readSync(path.join(base, entries[index], 'input.md'))
    input = String(file.contents)
    treePath = path.join(base, entries[index], 'tree.json')

    try {
      config = JSON.parse(
        fs.readFileSync(path.join(base, entries[index], 'config.json'))
      )
    } catch (_) {
      config = undefined
    }

    if (entries[index] === 'table-string-length') {
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
      output = fs.readFileSync(
        path.join(base, entries[index], 'output.md'),
        'utf8'
      )
    } catch (_) {
      output = input
    }

    t.deepEqual(actual, expected, entries[index] + ' (tree)')
    t.equal(
      String(proc.processSync(file)),
      output,
      entries[index] + ' (process)'
    )
  }

  t.end()
})
