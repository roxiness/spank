module.exports = {
    outputDir: 'output',
    entrypoint: 'dist/index.html',
    script: 'dist/main.js',
    eventName: '',
    host: 'http://spank.test',
    sitemap: [
        '/foo',
        '/bar',
        '/baz'
    ],
    blacklist: ['/link2']
    // forceIndex: false,    
    // inlineDynamicImports: false,
    // concurrently: 3
}