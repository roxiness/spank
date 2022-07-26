import assert from 'assert'

import fse from 'fs-extra'
import { execSync, spawnSync } from 'child_process'
import { resolve } from 'path'
import { URL, pathToFileURL } from 'url'

const { removeSync, readFileSync, existsSync } = fse
export const cli = (args, url) => {
    const cwd =  (new URL('.', url)).href.replace('file:///','')
    const cliPath =  (new URL('../cli.js', import.meta.url)).href.replace('file:///','')
    
    const output = resolve(cwd, 'output')
    removeSync(output)
    execSync(`node ${cliPath} ${args}`, {
        cwd,
        stdio: 'inherit',
    })
    return {
        cwd,
        output: resolve(cwd, 'output'),
        exists: path => existsSync(resolve(output, path)),
        verifyFile(path, re) {
            const html = readFileSync(resolve(output, path), 'utf-8')
            assert.ok(html.match(re))
        },
        resolve: path => resolve(output, path),
    }
}
