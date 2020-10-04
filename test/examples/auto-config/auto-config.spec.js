const test = require('ava').default
const { cli } = require('../../utils')
const { existsSync } = require('fs-extra')

test('auto-config', t => {
    const { resolve } = cli(t, '--output-dir output --write-summary', __dirname)
    t.truthy(existsSync(resolve('local/index.html')))
    t.truthy(existsSync(resolve('index.html')))
    t.truthy(existsSync(resolve('foo/index.html')))
})