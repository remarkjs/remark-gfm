/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('../index.js').Options} Options
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import test from 'tape'
import {readSync} from 'to-vfile'
import {unified} from 'unified'
import {remark} from 'remark'
import {isHidden} from 'is-hidden'
import stringWidth from 'string-width'
import gfm from '../index.js'

test('gfm()', (t) => {
  t.doesNotThrow(() => {
    remark().use(gfm).freeze()
  }, 'should not throw if not passed options')

  t.doesNotThrow(() => {
    unified().use(gfm).freeze()
  }, 'should not throw if without parser or compiler')

  t.end()
})

test('fixtures', (t) => {
  const base = path.join('test', 'fixtures')
  const entries = fs.readdirSync(base)
  let index = -1

  while (++index < entries.length) {
    if (isHidden(entries[index])) continue

    const file = readSync(path.join(base, entries[index], 'input.md'))
    const input = String(file.value)
    const treePath = path.join(base, entries[index], 'tree.json')
    /** @type {Options|undefined} */
    let config

    try {
      config = JSON.parse(
        String(fs.readFileSync(path.join(base, entries[index], 'config.json')))
      )
    } catch {}

    if (entries[index] === 'table-string-length') {
      config = {stringLength: stringWidth}
    }

    const proc = remark().use(gfm, config).freeze()
    const actual = proc.parse(file)
    /** @type {Root} */
    let expected

    try {
      expected = JSON.parse(String(fs.readFileSync(treePath)))

      if ('UPDATE' in process.env) {
        throw new Error('Regenerate')
      }
    } catch {
      // New fixture.
      fs.writeFileSync(treePath, JSON.stringify(actual, null, 2) + '\n')
      expected = actual
    }

    /** @type {string} */
    let output

    try {
      output = fs.readFileSync(
        path.join(base, entries[index], 'output.md'),
        'utf8'
      )
    } catch {
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
