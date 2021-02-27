const test = require('ava').default
const { cli } = require('../../utils')

test('no config file', t => {
    const { cwd, verifyFile } = cli(t, '--sitemap sitemap.js --output-dir output --entrypoint dist/index.html --script dist/main.js --event-name "" --host http://spank.test "" --variations en,de,fr', __dirname)
    verifyFile('bar/index.html', new RegExp('<div id="location">http://spank.test/bar</div>'))
})
