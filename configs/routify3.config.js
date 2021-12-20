module.exports = {
    name: 'Routify 3 + Vite',
    supersedes: ['routify2', 'routify'],
    condition: ({ pkgjson }) => {
        const routify =
            pkgjson.dependencies['@roxi/routify'] ||
            pkgjson.devDependencies['@roxi/routify']
        const vite = pkgjson.dependencies.vite
        return routify && vite && routify.replace(/[^\d]/g, '')[0] == 3
    },
    // todo should get defaults
    config: () => {
        return {
            sitemap: ['/'],
            output: 'dist',
            template: 'dist/index.html',
            eventName: 'app-loaded',
        }
    },
}
