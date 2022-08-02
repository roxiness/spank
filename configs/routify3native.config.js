import { findFirstPath } from '../utils.js'
import fse from 'fs-extra'

export default {
    name: 'Routify 3 Native',
    condition: ({ pkgjson }) => {
        const isRoutify = pkgjson.dependencies['@roxi/routify']
        const hasNativeSsrSyntax = fse.existsSync('dist/server/render.js')
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
