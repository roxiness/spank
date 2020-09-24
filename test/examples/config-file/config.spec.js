const test = require('ava').default
const { cli } = require('../../utils')

test('config file', t => {
    const { verifyFile, exists } = cli(t, '', __dirname)
    verifyFile('bar.html', new RegExp('<div id="location">http://spank.test/bar</div>'))
    t.assert(exists('link1.html'))
    t.falsy(exists('link2.html'), 'blacklisted links should not be rendered')
})
