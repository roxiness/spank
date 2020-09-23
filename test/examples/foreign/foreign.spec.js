const test = require('ava').default
const { cli } = require('../../utils')
const { existsSync } = require('fs-extra')

test('foreign', t => {
    const { resolve } = cli(t, '--depth 3', __dirname)
    t.truthy(existsSync(resolve('local.html')))
    t.truthy(existsSync(resolve('local-full.html')))
    t.falsy(existsSync(resolve('foreign.html')))
})