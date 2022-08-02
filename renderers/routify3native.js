import fse from 'fs-extra'
const { existsSync, readFileSync } = fse
/**
 * Renders a single Routify 3 page
 * @param {string} template path to template (index.html)
 * @param {string} script path to script (App.js)
 * @param {string} url
 * @returns
 */
export async function routify3native(template, script, url) {
    try {
        template = existsSync(template) ? readFileSync(template, 'utf-8') : template
        const path = 'file:///' + process.cwd() + '/' + script + '?url=' + url
        const app = await import(path)

        const { html, head, css } = await app.render(url)

        return template
            .replace('<!--ssr:html-->', html)
            .replace('<!--ssr:head-->', head)
            .replace('<!--ssr:css-->', css)
    } catch (err) {
        console.error(`failed to render "${url}"\n`, err)
        return template.replace('<!--ssr:html-->', `<h3>failed to render "${url}"</h3>`)
    }
}
