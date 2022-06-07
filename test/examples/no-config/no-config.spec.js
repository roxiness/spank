const test = require('ava').default
const { cli } = require('../../utils')

test('no config file', t => {
    const { cwd, verifyFile } = cli(t, '--sitemap sitemap.js --output-dir output --template dist/index.html --script dist/main.js ""', __dirname)
    verifyFile('bar/index.html', new RegExp('<div id="location">http://jsdom.ssr/bar</div>'))
})
