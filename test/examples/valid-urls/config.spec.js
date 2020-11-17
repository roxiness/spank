const test = require('ava').default
const { readdirSync } = require('fs')
const { cli } = require('../../utils')

test('config file', t => {
    const { verifyFile, exists } = cli(t, '', __dirname)

    t.deepEqual(readdirSync(__dirname + '/output'), [
        'foo',
        'index.html',
        'local-link',
        'local-link2',
        'relative-link',
        'relative-vanilla'
    ])
})
