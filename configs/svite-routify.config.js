export default {
    name: 'Svite / Routify 2',
    supersedes: ['routify2', 'routify'],
    condition: ({ pkgjson }) => pkgjson.dependencies['@svitejs/vite-plugin-svelte'],
    config: () => {
        const config = {
            sitemap: '.routify/urlIndex.json',
            template: 'dist/index.html',
            inlineDynamicImports: true,
            outputDir: 'dist',
            eventName: 'app-loaded',
        }

        const script = getScript(config.template)
        if (script)
            config.script = `dist${script}`

        return config
    }
}

function getScript(template) {
    const { readFileSync, existsSync } = require('fs')
    if (existsSync(template))
        return readFileSync(template, 'utf8')
            .match(/<script .+?src="([^"]+)"/)[1]
}