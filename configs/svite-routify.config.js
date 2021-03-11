module.exports = {
    name: 'Svite / Routify 2',
    supersedes: ['routify2', 'routify'],
    condition: ({ pkgjson }) => pkgjson.dependencies['@svitejs/vite-plugin-svelte'],
    config: () => {
        const config = {
            sitemap: '.routify/urlIndex.json',
            entrypoint: 'dist/index.html',
            inlineDynamicImports: true,
            outputDir: 'dist',
            eventName: 'app-loaded',
        }

        const script = getScript(config.entrypoint)
        if (script)
            config.script = `dist${script}`

        return config
    }
}

function getScript(entrypoint) {
    const { readFileSync, existsSync } = require('fs')
    if (existsSync(entrypoint))
        return readFileSync(entrypoint, 'utf8')
            .match(/<script .+?src="([^"]+)"/)[1]
}