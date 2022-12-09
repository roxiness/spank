export default {
    outputDir: 'output',
    template: 'dist/index.html',
    script: 'dist/main.js',
    host: 'http://spank.test',
    sitemap: ['/index'],
    renderOptions: {
        inlineDynamicImports: true,
        eventName: 'app-loaded',
    }
}