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
    blacklist: ['/link2', /\/link[3|4]/],
    copyEntrypointTo: 'output/__template.html'
}