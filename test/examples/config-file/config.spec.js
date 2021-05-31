const test = require('ava').default
const { cli } = require('../../utils')

test('config file', t => {
    const { verifyFile, exists } = cli(t, '', __dirname)
    verifyFile('bar/index.html', new RegExp('<div id="location">http://spank.test/bar</div>'))
    t.assert(exists('link1/index.html'))
    t.assert(exists('__template.html'))
    t.falsy(exists('link2/index.html'), 'blacklisted links should not be rendered')
    t.falsy(exists('link3/index.html'), 'blacklisted links should not be rendered')
    t.falsy(exists('link4/index.html'), 'blacklisted links should not be rendered')
})
