#!/usr/bin/env node

const { start } = require('./index')
const program = require('commander')
const _defaults = require('./defaults')

require('./getConfig')
    .getConfig()
    .then(config => {
        const defaults = { ..._defaults, ...config }

        program
            .option('-d, --debug', 'extra debugging')
            .option(
                '-m, --sitemap <path to js/json>',
                'array of relative URLs',
                defaults.sitemap,
            )
            .option(
                '-i, --inline-dynamic-imports',
                'Necessary for dynamic imports',
                defaults.inlineDynamicImports,
            )
            .option(
                '-f, --force-index',
                'Convert [path] to [path]/index.html',
                defaults.forceIndex,
            )
            .option('-e, --entrypoint <entrypoint>', 'HTML template', defaults.entrypoint)
            .option('-s, --script <script file>', 'Script file', defaults.script)
            .option('-o, --output-dir <folder>', 'Output folder', defaults.outputDir)
            .option(
                '-c, --concurrently <number>',
                'max running jobs',
                defaults.concurrently.toString(),
            )
            .option(
                '-v, --event-name <string|false>',
                'wait for this event before writing HTMLs',
                defaults.eventName,
            )
            .option('-h, --host <string>', 'URL prefix', defaults.host)
            .option(
                '-p, --depth <number>',
                'How deep to crawl for links',
                defaults.depth.toString(),
            )
            .option(
                '-w. --write-summary [path]',
                'Save summary of processed URLs',
                defaults.writeSummary,
            )
            .action(start)

        program.parse(process.argv)
    })
