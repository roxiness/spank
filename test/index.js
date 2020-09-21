const { removeSync, readFileSync } = require('fs-extra')
const { execSync } = require('child_process')
const { resolve } = require('path')
const assert = require('assert').strict
const cli = (args, path) => {
    const cwd = resolve(__dirname, 'examples', path)
    const output = resolve(cwd, 'output')
    console.log('remove', output)
    removeSync(output)
    execSync(`node ../../../cli.js ${args}`, { cwd, stdio: "inherit" })
    const html = readFileSync(resolve(output, 'baz.html'), 'utf-8')
    const str = '<div id="location">http://spank.test/baz</div>'
    /** @ts-ignore */
    assert(html.match(str))
}
cli('', 'config-file')
cli('--sitemap sitemap.js --output-dir output --entrypoint dist/index.html --script dist/main.js --event-name "" --host http://spank.test ""', 'no-config')