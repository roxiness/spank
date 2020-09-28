module.exports = {
    name: 'Svite / Routify 2',
    supersedes: ['routify2', 'routify'],
    condition: ({ pkgjson }) => pkgjson.dependencies['svite'],
    config: () => {
        const { readFileSync } = require('fs')
        const html = readFileSync('./dist/index.html', 'utf-8')
        const script = html.match(/src="\/(_assets\/index.\w+.js)"/)[1]
        return {
            script: `dist/${script}`,
            entrypoint: 'dist/index.html',
            inlineDynamicImports: true,
            sitemap: '.routify/urlIndex.json',
            output: 'dist',
            eventName: 'app-loaded',
        }
    }
}