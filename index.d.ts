import type {Options as MicromarkOptions} from 'micromark-extension-gfm'
import type {Options as MdastOptions} from 'mdast-util-gfm'

export {default} from './lib/index.js'

/**
 * Configuration for `remark-gfm`.
 *
 * Currently supports `singleTilde` as a parse option and
 * `tableCellPadding`, `tablePipeAlign`, and `stringLength` as
 * a serialization option.
 */
export interface Options extends MicromarkOptions, MdastOptions {}
