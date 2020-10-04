import unified = require('unified')
import gfm = require('remark-gfm')

unified().use(gfm)
unified().use(gfm, {})

unified().use(gfm, {singleTilde: true})
unified().use(gfm, {singleTilde: false})
unified().use(gfm, {singleTilde: 1}) // $ExpectError

unified().use(gfm, {tableCellPadding: true})
unified().use(gfm, {tableCellPadding: false})
unified().use(gfm, {tableCellPadding: []}) // $ExpectError

unified().use(gfm, {tablePipeAlign: true})
unified().use(gfm, {tablePipeAlign: false})
unified().use(gfm, {tablePipeAlign: ''}) // $ExpectError

unified().use(gfm, {stringLength: (_: string) => 0})
unified().use(gfm, {stringLength: (_: string) => false}) // $ExpectError

unified().use(gfm, {weird: true}) // $ExpectError
