module.exports = {
    
    /** The name displayed in the terminal */
    name: 'My Framework',
    
    /**
      * Conditions are resolved as async functions.
      * `pkgjson.dependencies` also contains devDependencies.
      **/
    condition: ({ pkgjson }) => pkgjson.dependencies['my-framework-lib'],

    /** 
     * this config will be merged with the default config and user config.
     * Order of precedence: 
     * CLI arguments > user config > this config > default config
     */
    config: () => ({
        sitemap: 'sitemap.json',
        output: 'dist',
        entrypoint: 'assets/index.html',
        script: 'dist/build/bundle.js',
    })
}