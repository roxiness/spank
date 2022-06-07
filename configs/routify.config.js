module.exports = {
    name: 'Routify',
    condition: ({ pkgjson }) => pkgjson.dependencies['@sveltech/routify'],
    config: () => {
        const hasBundle = require('fs-extra').existsSync('dist/build/bundle.js')
        return {
            sitemap: '.routify/urlIndex.json',
            outputDir: 'dist',
            template: 'dist/__app.html',
            script: hasBundle ? 'dist/build/bundle.js' : 'dist/build/main.js',
            eventName: 'app-loaded',
            inlineDynamicImports: !hasBundle
        }
    }
}