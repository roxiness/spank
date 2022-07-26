import { cli } from '../../utils.js'
import fse from 'fs-extra'

test('auto-config', () => {
    const { exists } = cli('--output-dir output --write-summary', import.meta.url)

    assert(exists('index.html'))
    assert(exists('local/index.html'))
})
