const { existsSync } = require('fs-extra')

/**
 * returns first path that exists
 * @param {string[]} paths
 */
const findFirstPath = paths => {
    for (const path of paths) if (existsSync(path)) return path
}

module.exports = {
    name: 'Routify 3 Native',
    supersedes: ['routify2', 'routify', 'Svite / Routify 2'],
    condition: ({ pkgjson }) => {
        const isRoutify = pkgjson.dependencies['@roxi/routify']
        const hasNativeSsrSyntax = existsSync('dist/server/render.js')
        return isRoutify && hasNativeSsrSyntax
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
            script: './dist/server/render.js',
            eventName: 'app-loaded',
            inlineDynamicImports: false,
        }
    },
}
