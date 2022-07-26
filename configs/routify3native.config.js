const { findFirstPath } = require('../utils.cjs')

module.exports = {
    name: 'Routify 3 Native',
    condition: ({ pkgjson }) => {
        const isRoutify = pkgjson.dependencies['@roxi/routify']
        return isRoutify && require('fs-extra').existsSync('dist/server/App.js')
    },
    config: () => {
        return {
            renderer: 'routify3native',
            sitemap: ['/index'],
            outputDir: 'dist/client',
            template: findFirstPath([
                'dist/client/__app.html',
                'dist/client/index.html',
                'dist/index.__app',
                'dist/index.html',
                'index.html',
                'src/index.html',
            ]),
            script: './dist/server/App.js',
            eventName: 'app-loaded',
            inlineDynamicImports: false,
        }
    },
}
