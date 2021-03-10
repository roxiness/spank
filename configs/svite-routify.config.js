module.exports = {
    name: 'Svite / Routify 2',
    supersedes: ['routify2', 'routify'],
    condition: ({ pkgjson }) => pkgjson.dependencies['@svitejs/vite-plugin-svelte'],
    config: () => {
        const { readFileSync } = require('fs')
        const html = readFileSync('./dist/index.html', 'utf8')
        const script = html.match(/<script .+?src="([^"]+)"/)[1]
        return {
            sitemap: '.routify/urlIndex.json',
            script: `dist${script}`,
            entrypoint: 'dist/index.html',
            inlineDynamicImports: true,
            outputDir: 'dist',
            eventName: 'app-loaded',
        }
    }
}