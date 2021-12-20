module.exports = {
    outputDir: 'dist',
    template: 'dist/__app.html',
    forceIndex: true,
    sitemap: ['/'],
    /** @type {(string|RegExp)[]} */
    blacklist: [],
    concurrently: 3,
    host: 'http://localhost',
    depth: 2,
    writeSummary: false,
    copyTemplateTo: null,
    ssrOptions: {
        beforeEval: dom => {
            const scriptElem = dom.window.document.createElement('script')
            scriptElem.innerHTML = 'window.__preRendered = true'
            dom.window.__preRendered = true
            dom.window.document.head.appendChild(scriptElem)
        }
    }
}