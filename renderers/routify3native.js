const { existsSync, readFileSync } = require('fs-extra')

async function routify3native(template, script, url) {
    const app = require(process.cwd() + '/' + script)
    await app.load(url)
    const { html, head, css } = app.default.render()

    template = existsSync(template) ? readFileSync(template, 'utf-8') : template

    const re = template
        .replace('<!--ssr:html-->', html)
        .replace('<!--ssr:head-->', head)
        .replace('<!--ssr:css-->', css)

    return re
}

module.exports = { routify3native }
