const { removeSync, readFileSync, existsSync } = require('fs-extra')
const { execSync } = require('child_process')
const { resolve } = require('path')
const cli = (t, args, cwd) => {
    const output = resolve(cwd, 'output')
    removeSync(output)
    execSync(`node ${resolve(__dirname, '..', 'cli.js')} ${args}`, { cwd, stdio: "inherit" })

    return {
        cwd,
        output: resolve(cwd, 'output'),
        verifyFile(path, re) {
            const html = readFileSync(resolve(output, path), 'utf-8')
            t.regex(html, re)
        },
        resolve: path => resolve(output, path)
    }
}

module.exports = { cli }