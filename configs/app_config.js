const map = {
    template: 'template',
    distDir: 'outputDir',
    assets: 'assetsDir',
}


export default {
    name: 'appConfig',
    condition: ({ pkgjson }) => pkgjson.appConfig,
    supersedes: ['default', 'svite'],
    config: ({ pkgjson }) => Object.entries(pkgjson.appConfig)
        .reduce((acc, [key, val]) => ({
            ...acc,
            [map[key] || key]: val
        }), {})
}
