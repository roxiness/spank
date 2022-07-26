const { readdirSync } = require('fs')
import { cli } from '../../utils.js'

test('config file', () => {
    cli('', import.meta.url)
    assert.deepEqual(readdirSync(import.meta.url + '/output'), [
        'foo',
        'index.html',
        'local-link',
        'local-link2',
        'relative-link',
        'relative-vanilla',
    ])
})
