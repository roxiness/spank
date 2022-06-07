module.exports = {
    outputDir: 'output',
    template: 'dist/index.html',
    script: 'dist/main.js',
    sitemap: [
        '/foo',
        '/bar',
        '/baz'
    ],
    blacklist: ['/link2', /\/link[3|4]/],
    copyTemplateTo: 'output/__template.html',
    host: 'http://spank.test',
    renderOptions: {
        eventName: '',
        host: 'http://spank.test'
    }
}