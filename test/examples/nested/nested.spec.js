const test = require('ava').default
const { cli } = require('../../utils')
const { existsSync } = require('fs-extra')

test('nested', t => {
    const { cwd, verifyFile, resolve } = cli(t, '--depth 3', __dirname)
    verifyFile('page/100.html', new RegExp('<a href="/page/99" id="prev-page">'))
    verifyFile('page/100.html', new RegExp('<a href="/page/101" id="next-page">'))
    verifyFile('page/103.html', new RegExp('<a href="/page/104" id="next-page">'))
    verifyFile('page/97.html', new RegExp('<a href="/page/96" id="prev-page">'))

    t.falsy(existsSync(resolve('page/96.html')))
    t.falsy(existsSync(resolve('page/104.html')))
})