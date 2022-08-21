module.exports = {
    name: 'Routify 2',
    condition: ({ pkgjson }) => pkgjson.dependencies['@roxi/routify']?.match(/^(\^|\~|\>\=)?2\./),
    config: () => {
        const hasBundle = require('fs-extra').existsSync('dist/build/bundle.js')
        return {
            sitemap: '.routify/urlIndex.json',
            outputDir: 'dist',
            template: 'dist/__app.html',
            script: hasBundle ? 'dist/build/bundle.js' : 'dist/build/main.js',
            eventName: 'app-loaded',
            inlineDynamicImports: !hasBundle,
        }
    },
}
