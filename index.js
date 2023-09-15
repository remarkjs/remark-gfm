/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('micromark-extension-gfm').Options & import('mdast-util-gfm').Options} Options
 * @typedef {import('unified').Processor<Root>} Processor
 */

import {gfm} from 'micromark-extension-gfm'
import {gfmFromMarkdown, gfmToMarkdown} from 'mdast-util-gfm'

/**
 * Plugin to support GFM (autolink literals, footnotes, strikethrough, tables, tasklists).
 *
 * @param {Options | null | undefined} [options='yaml']
 *   Configuration (default: `'yaml'`).
 * @returns {undefined}
 *   Nothing.
 */
export default function remarkGfm(options = {}) {
  // @ts-expect-error: TS is wrong about `this`.
  // eslint-disable-next-line unicorn/no-this-assignment
  const self = /** @type {Processor} */ (this)
  const data = self.data()

  add('micromarkExtensions', gfm(options))
  add('fromMarkdownExtensions', gfmFromMarkdown())
  add('toMarkdownExtensions', gfmToMarkdown(options))

  /**
   * @param {string} field
   * @param {unknown} value
   */
  function add(field, value) {
    const list = /** @type {unknown[]} */ (
      // Other extensions
      /* c8 ignore next 2 */
      // @ts-expect-error: to do: remove when remark is released.
      data[field] || (data[field] = [])
    )

    list.push(value)
  }
}
