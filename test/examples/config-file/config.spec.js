
import {cli} from '../../utils.js'

test('config file', () => {
    const { verifyFile, exists } = cli('', import.meta.url)
    verifyFile('bar/index.html', new RegExp('<div id="location">http://spank.test/bar</div>'))
    assert(exists('link1/index.html'))
    assert(exists('__template.html'))
    assert(!exists('link2/index.html'), 'blacklisted links should not be rendered')
    assert(!exists('link3/index.html'), 'blacklisted links should not be rendered')
    assert(!exists('link4/index.html'), 'blacklisted links should not be rendered')
})
