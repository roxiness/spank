
import {cli} from '../../utils.js'

test('config file', () => {
    const { verifyFile } = cli('', import.meta.url)
    verifyFile('index.html', new RegExp('<div id="status">imported</div>'))
})
