const test = require('ava').default
const {cli} = require('../../utils')

test('config file', t => {
    const { verifyFile } = cli(t, '', __dirname)
    verifyFile('bar.html', new RegExp('<div id="location">http://spank.test/bar</div>'))
})
