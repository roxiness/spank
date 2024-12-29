export default {
    outputDir: 'dist/client',
    template: 'dist/__app.html',
    script: 'dist/build/bundle.js',
    forceIndex: true,
    sitemap: ['/'],
    /** @type {(string|RegExp)[]} */
    blacklist: [],
    concurrently: 3,
    eventName: "",
    depth: 5,
    writeSummary: false,
    copyTemplateTo: null,
    renderer: 'tossr',
    transform: (html, url) => html,
    /** @type {any} */
    renderOptions: {
        eventName: 'app-loaded',
        beforeEval: dom => {
            const scriptElem = dom.window.document.createElement('script')
            scriptElem.innerHTML = 'window.__preRendered = true'
            dom.window.__preRendered = true
            dom.window.document.head.appendChild(scriptElem)
        }
    },
}
