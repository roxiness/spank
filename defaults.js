module.exports = {
    outputDir: 'dist',
    entrypoint: 'dist/__app.html',
    script: 'dist/build/bundle.js',
    forceIndex: true,
    sitemap: ['/'],
    blacklist: [],
    inlineDynamicImports: false,
    concurrently: 3,
    eventName: "",
    host: 'http://jsdom.ssr',
    depth: 2,
    writeSummary: false,
    copyEntrypointTo: null,
    ssrOptions: {
        beforeEval: dom => {
            const scriptElem = dom.window.document.createElement('script')
            scriptElem.innerHTML = 'window.__preRendered = true'
            dom.window.__preRendered = true
            dom.window.document.head.appendChild(scriptElem)
        }
    }
}