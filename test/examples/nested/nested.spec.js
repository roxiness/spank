
import {cli} from '../../utils.js'
import fse from 'fs-extra'
const { existsSync } = fse

test('nested', () => {
    const { cwd, verifyFile, resolve } = cli('--depth 3', import.meta.url)
    verifyFile('page/100/index.html', new RegExp('<a href="/page/99" id="prev-page">'))
    verifyFile('page/100/index.html', new RegExp('<a href="/page/101" id="next-page">'))
    verifyFile('page/103/index.html', new RegExp('<a href="/page/104" id="next-page">'))
    verifyFile('page/97/index.html', new RegExp('<a href="/page/96" id="prev-page">'))

    assert(!existsSync(resolve('page/96.html')))
    assert(!existsSync(resolve('page/104.html')))
})