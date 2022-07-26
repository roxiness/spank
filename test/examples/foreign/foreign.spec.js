import { cli } from '../../utils.js'
test('foreign', () => {
    const { exists } = cli('--depth 3', import.meta.url)

    assert(exists('local/index.html'))
    assert(exists('local-full/index.html'))
    assert(!exists('foreign/index.html'))
})
