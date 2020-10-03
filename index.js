/** @typedef {import('./defaults')} Options */
/** @typedef {{path: string, children?: Url[]}} Url */

const { resolve } = require('path')
const { outputFile } = require('fs-extra')
const { tossr } = require('tossr')
const { parse } = require('node-html-parser')
const ora = require('ora');
let spinner

/** @param {Options} options */
async function start(options) {
    const queue = new Queue(options.concurrently)
    const hostname = options.host.match(/^https?:\/\/([^/]+)/)[1]

    /** @type {Url[]} */
    const urls = (
        Array.isArray(options.sitemap)
            ? [...options.sitemap]
            : require(resolve(process.cwd(), options.sitemap))
    ).map(path => ({ path }))

    spinner = ora({ interval: 20 }).start()
    let counter = 0

    /** @param {Url} url */
    const short = url => url.path.replace(/\/index$/, '')

    /** @param {Url} url */
    const isUnique = url => !urls.find(oldUrl => short(url) === short(oldUrl))
    
    /** @param {Url} url */
    const isntBlacklisted = url => !options.blacklist.includes(url.path)

    /** @param {Url} url */
    const isLocal = url => {
        const match = url.path.match(/^https?:\/\/([^/]+)/)
        return !match || match[1] === hostname
    }

    /** @param {Url} parent */
    const normalize = parent => url => {
        const match = url.path.match(/^https?:\/\/[^/]+(.+)/)
        if (match)
            url.path = match[1]
        else if (!url.path.startsWith('/'))
            url.path = `${parent.path.replace(/\/$/, '')}/${url.path}`
        url.path = url.path
            .replace(/^\/$/, '/index')
            .replace(/^([^#?]+).*$/, '$1')
            .replace(/\/$/, '')

        return url
    }


    if (options.inlineDynamicImports) {
        spinner.text = 'Inlining dynamic imports'
        options.script = await resolveScript(options)
        spinner.succeed('Inline dynamic imports')
        spinner = ora({ interval: 20 }).start()
    }

    const urlToHtml = saveUrlToHtml(options)

    processUrls(urls)

    /** @param {Url[]} _urls */
    function processUrls(_urls, depth = 0) {
        _urls.forEach((url) => {
            queue.push(async () => {
                counter++
                spinner.text = `Exporting ${counter} of ${urls.length} ${url.path}`
                // console.log(`Exporting ${counter} of ${uniqueUrls.length} ${url.path}`)
                url.children = await urlToHtml(url.path)

                if (depth < options.depth) {
                    const newUrls = url.children
                        .filter(isLocal)
                        .map(normalize(url))
                        .filter(isUnique)
                        .filter(isntBlacklisted)
                    urls.push(...newUrls)
                    processUrls(newUrls, depth + 1)
                }
            })
        })
    }

    const time = Date.now()
    await new Promise((resolve) => { queue.done = () => resolve() })
    spinner.succeed(`Exported ${urls.length} pages in ${Date.now() - time} ms`)

    if (options.writeSummary)
        writeSummary(urls, options)
}

/**
 * @param {Url[]} urls
 * @param {Options} options
 */
function writeSummary(urls, options) {
    const path = options.writeSummary.toString().replace(/^true$/, 'spank-summary.json')
    outputFile(path, JSON.stringify({
        time: new Date(),
        options,
        exports: urls.length,
        list: urls.map(url => url.path),
        discovery: urls,
    }, null, 2))
}


/** @param {Options} options */
function saveUrlToHtml(options) {
    const { entrypoint, script, outputDir, forceIndex, eventName, host } = options

    /** @param {string} url */
    return async function urlToHtml(url) {
        const html = await tossr(entrypoint, script, url, { silent: true, eventName, host })
        const suffix = forceIndex && !url.endsWith('/index') ? '/index' : ''
        await outputFile(`${outputDir + url + suffix}.html`, html)
        const dom = parse(html)
        return dom.querySelectorAll('a').map(s => (
            { path: s.attributes.href }
        ))
    }
}

/** @param {Options} options */
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