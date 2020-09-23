/** @typedef {import('./getConfig.js')['defaults']} defaults */

const { resolve } = require('path')
const { outputFile, writeFileSync } = require('fs-extra')
const { ssr } = require('@roxi/ssr')
const { parse } = require('node-html-parser')
const ora = require('ora');
let spinner

/** @param {defaults} options */
async function start(options) {
    const queue = new Queue(options.concurrently)
    const hostname = options.host.match(/^https?:\/\/([^/]+)/)[1]
    const uniqueUrls = require(resolve(process.cwd(), options.sitemap))
        .map(path => ({ path }))
    spinner = ora({ interval: 20 }).start()
    let counter = 0

    const isUnique = url => !uniqueUrls.find(oldUrl => url.path === oldUrl.path
    )
    const isLocal = url => {
        const match = url.path.match(/^https?:\/\/([^/]+)/)
        return !match || match[1] === hostname
    }
    const normalize = parent => url => {
        const match = url.path.match(/^https?:\/\/[^/]+(.+)/)
        if (match)
            url.path = match[1]
        else if (!url.path.startsWith('/'))
            url.path = `${parent.path.replace(/\/$/, '')}/${url.path}`
        return url
    }


    if (options.inlineDynamicImports) {
        spinner.text = 'Inlining dynamic imports'
        options.script = await resolveScript(options)
        spinner.succeed('Inline dynamic imports')
        spinner = ora({ interval: 20 }).start()
    }

    const urlToHtml = saveUrlToHtml(options)

    processUrls(uniqueUrls)

    function processUrls(list, depth = 0) {
        list.forEach((url) => {
            return queue.push(async () => {
                counter++
                // spinner.text = `Exporting ${counter} of ${uniqueUrls.length} ${url.path}`
                console.log(`Exporting ${counter} of ${uniqueUrls.length} ${url.path}`)
                url.children = await urlToHtml(url.path)

                if (depth < options.depth) {
                    const newUrls = url.children.filter(isLocal).map(normalize(url)).filter(isUnique)
                    uniqueUrls.push(...newUrls)
                    processUrls(newUrls, depth + 1)
                }
            })
        })
    }

    const time = Date.now()
    await new Promise((resolve) => { queue.done = () => resolve() })
    spinner.succeed(`Exported ${uniqueUrls.length} pages in ${Date.now() - time} ms`)

    if (options.writeSummary) {
        const path = options.writeSummary.toString().replace(/^true$/, 'spank-summary.json')
        writeFileSync(path, JSON.stringify({
            list: uniqueUrls.map(url => url.path),
            discovery: uniqueUrls,
        }, null, 2))
    }
}


/** @param {defaults} options */
function saveUrlToHtml(options) {
    const { entrypoint, script, outputDir, forceIndex, eventName, host } = options

    /** @param {string} url */
    return async function urlToHtml(url) {
        const html = await ssr(entrypoint, script, url, { silent: true, eventName, host })
        const suffix = forceIndex && !url.endsWith('/index') ? '/index' : ''
        await outputFile(`${outputDir + url + suffix}.html`, html)
        const dom = parse(html)
        return dom.querySelectorAll('a').map(s => (
            { path: s.attributes.href }
        ))
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

module.exports = { start }