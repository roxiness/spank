module.exports = {
    outputDir: 'dist',
    entrypoint: 'dist/__app.html',
    script: 'dist/build/bundle.js',
    forceIndex: false,
    sitemap: ['/'],
    inlineDynamicImports: false,
    concurrently: 3,
    eventName: "",
    host: 'http://jsdom.ssr',
    depth: 2,
    writeSummary: false
}