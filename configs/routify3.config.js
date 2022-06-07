const { findFirstPath } = require('../utils')

module.exports = {
    name: 'Routify 3',
    condition: ({ pkgjson }) => {
        return pkgjson.dependencies['@roxi/routify']
    },
    config: () => {
        const hasBundle = require('fs-extra').existsSync('dist/build/bundle.js')
        return {
            sitemap: ['/index'],
            outputDir: 'dist/client',
            template: findFirstPath([
                'dist/__app.html',
                'dist/index.html',
                'dist/client/index.html',
                'index.html',
                'src/index.html',
            ]),
            script: findFirstPath([
                'dist/build/bundle.js',
                'dist/build/main.js',
                './dist/server/App.js',
            ]),
            eventName: 'app-loaded',
            inlineDynamicImports: !hasBundle,
        }
    },
}
