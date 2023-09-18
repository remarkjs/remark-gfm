/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('remark-gfm').Options} Options
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import test from 'node:test'
import {isHidden} from 'is-hidden'
import {remark} from 'remark'
import remarkGfm from 'remark-gfm'
import stringWidth from 'string-width'

test('remarkGfm', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('remark-gfm')).sort(), [
      'default'
    ])
  })

  await t.test('should not throw if not passed options', async function () {
    assert.doesNotThrow(function () {
      remark().use(remarkGfm).freeze()
    })
  })
})

test('fixtures', async function (t) {
  const base = new URL('fixtures/', import.meta.url)
  const folders = await fs.readdir(base)

  let index = -1

  while (++index < folders.length) {
    const folder = folders[index]

    if (isHidden(folder)) continue

    await t.test(folder, async function () {
      const folderUrl = new URL(folder + '/', base)
      const inputUrl = new URL('input.md', folderUrl)
      const outputUrl = new URL('output.md', folderUrl)
      const treeUrl = new URL('tree.json', folderUrl)
      const configUrl = new URL('config.json', folderUrl)

      const input = String(await fs.readFile(inputUrl))

      /** @type {Options | undefined} */
      let config
      /** @type {Root} */
      let expected
      /** @type {string} */
      let output

      try {
        config = JSON.parse(String(await fs.readFile(configUrl)))
      } catch {}

      if (folder === 'table-string-length') {
        config = {stringLength: stringWidth}
      }

      const proc = remark().use(remarkGfm, config)
      const actual = proc.parse(input)

      try {
        output = String(await fs.readFile(outputUrl))
      } catch {
        output = input
      }

      try {
        if ('UPDATE' in process.env) {
          throw new Error('Updating…')
        }

        expected = JSON.parse(String(await fs.readFile(treeUrl)))
      } catch {
        expected = actual

        // New fixture.
        await fs.writeFile(treeUrl, JSON.stringify(actual, undefined, 2) + '\n')
      }

      assert.deepEqual(actual, expected)

      assert.equal(String(await proc.process(input)), String(output))
    })
  }
})
