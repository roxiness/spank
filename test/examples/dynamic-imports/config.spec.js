const test = require('ava').default
const { cli } = require('../../utils')

test('config file', t => {
    const { verifyFile } = cli(t, '', __dirname)
    verifyFile('index.html', new RegExp('<div id="status">imported</div>'))
})
