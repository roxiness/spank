#!/usr/bin/env node

const program = require('commander')
const ora = require('ora')
const { resolve } = require('path')
const { existsSync, outputFile } = require('fs-extra')
const { ssr } = require('@sveltech/ssr')
const CONFIG = 'spank.config.js'
let spinner

const defaults = {
    outputDir: 'dist',
    entrypoint: 'dist/__app.html',
    script: 'dist/build/bundle.js',
    forceIndex: false,
    sitemap: 'urls.js',
    inlineDynamicImports: false,
    concurrently: 3
};

(async function cli() {
    if (existsSync(CONFIG))
        Object.assign(defaults, await require(resolve(process.cwd(), CONFIG)))

    program
        .option('-d, --debug', 'extra debugging')
        .option('-m, --sitemap <location>', defaults.urls)
        .option('-i, --inline-dynamic-imports', 'Necessary for imports', defaults.inlineDynamicImports)
        .option('-f, --force-index', 'Convert all files to [name]/index.html', defaults.forceIndex)
        .option('-e, --entrypoint <entrypoint>', "HTML template", defaults.entrypoint)
        .option('-s, --script <script file>', "Script file", defaults.script)
        .option('-o, --output-dir <folder>', "Output folder", defaults.outputDir)
        .option('-c, --concurrently <number>', "Output folder", defaults.concurrently.toString())
        .action(program => {
            const options = program.opts()
            runExports(options)
        })

    program.parse(process.argv)
})()

/** @param {defaults} options */
async function runExports(options) {
    spinner = ora({ interval: 20 }).start()
    const urls = require(resolve(process.cwd(), options.sitemap))
    if (options.inlineDynamicImports) {
        spinner.text = 'Inlining dynamic imports'
        options.script = await resolveScript(options)
        spinner.succeed('Inline dynamic imports')
        spinner = ora({ interval: 20 }).start()
    }

    const urlToHtml = saveUrlToHtml(options)
    const queue = new Queue(options.concurrently)
    urls.forEach((url, index) => queue.push(async () => {
        spinner.text = `Exporting ${index + 1} of ${urls.length} ${url}`
        await urlToHtml(url)
    }))

    const time = Date.now()
    await new Promise((resolve) => { queue.done = () => resolve() })
    spinner.succeed(`Exported ${urls.length} pages in ${Date.now() - time} ms`)
}


/** @param {defaults} options */
function saveUrlToHtml(options) {
    const { entrypoint, script, outputDir, forceIndex } = options

    /** @param {string} url */
    return async url => {
        const html = await ssr(entrypoint, script, url, { silent: true })
        const suffix = forceIndex && !url.endsWith('/index') ? '/index' : ''
        await outputFile(`${outputDir}/test/${url + suffix}.html`, html)
    }
}

/** @param {defaults} options */
async function resolveScript({ script }) {
    const bundle = await require('rollup').rollup({ input: script, inlineDynamicImports: true, })
    const { output } = await bundle.generate({ format: 'umd', name: "bundle" })
    return output[0].code
}


/** @param {number} concurrency */
function Queue(concurrency) {
    /** @type {function[]} */
    const queue = []
    let freeSlots = concurrency
    this.done = () => { }
    const _this = this

    /** @param {function=} fn */
    this.push = function (fn) {
        queue.push(fn)
        this.runAll()
    }
    this.runAll = async function runAll() {
        if (freeSlots && queue.length) {
            freeSlots--
            const fn = queue.shift()
            await fn()
            freeSlots++
            runAll()
        }
        if (!queue.length && concurrency - freeSlots === 0) {
            _this.done()
        }
    }
    return this
}
