#!/usr/bin/env node

import { start } from './index.js'
import program from 'commander'

import {getConfig } from './getConfig.js'

(async function cli() {
    const defaults = await getConfig()
    program
        .option('-d, --debug', 'extra debugging')
        .option('-m, --sitemap <path to js/json>', 'array of relative URLs', defaults.sitemap)
        .option('-e, --template <template>', "HTML template", defaults.template)
        .option('-s, --script <script file>', "Script file", defaults.script)
        .option('-s, --renderer <renderer>', "Script file", defaults.renderer)
        .option('-o, --output-dir <folder>', "Output folder", defaults.outputDir)
        .option('-c, --concurrently <number>', "max running jobs", defaults.concurrently.toString())
        .option('-h, --host <string>', 'URL prefix', defaults.host)
        .option('-p, --depth <number>', 'How deep to crawl for links', defaults.depth.toString())
        .option('-w. --write-summary [path]', 'Save summary of processed URLs', defaults.writeSummary)
        .action(program => {
            const options = program.opts()
            start({ ...defaults, ...options })
        })

    program.parse(process.argv)
})()
