const { existsSync, readFileSync } = require('fs-extra')

/**
 * Renders a single Routify 3 page
 * @param {string} template path to template (index.html)
 * @param {string} script path to script (App.js)
 * @param {string} url
 * @returns
 */
async function routify3native(template, script, url) {
    try {
        template = existsSync(template) ? readFileSync(template, 'utf-8') : template

        const app = requireUncached(process.cwd() + '/' + script)
        await app.load(url)

        const { html, head, css } = app.default.render()

        return template
            .replace('<!--ssr:html-->', html)
            .replace('<!--ssr:head-->', head)
            .replace('<!--ssr:css-->', css)
    } catch (err) {
        console.error(`failed to render "${url}"\n`, err)
        return template.replace('<!--ssr:html-->', `<h3>failed to render "${url}"</h3>`)
    }
}

function requireUncached(path) {
    delete require.cache[require.resolve(path)]
    return require(path)
}

module.exports = { routify3native }
