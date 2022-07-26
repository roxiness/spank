

import {cli} from '../../utils.js'

test('no config file', () => {
    const { cwd, verifyFile } = cli('--sitemap sitemap.js --output-dir output --template dist/index.html --script dist/main.js ""', import.meta.url)
    verifyFile('bar/index.html', new RegExp('<div id="location">http://jsdom.ssr/bar</div>'))
})
