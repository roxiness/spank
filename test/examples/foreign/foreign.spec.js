const test = require('ava').default
const { cli } = require('../../utils')
const { existsSync } = require('fs-extra')

test('foreign', t => {
    const { resolve } = cli(t, '--depth 3', __dirname)
    t.truthy(existsSync(resolve('local/index.html')))
    t.truthy(existsSync(resolve('local-full/index.html')))
    t.falsy(existsSync(resolve('foreign/index.html')))
})