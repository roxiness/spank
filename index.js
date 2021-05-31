/** @typedef {import('./defaults')} Options */
/** @typedef {{path: string, children?: Url[]}} Url */

const { resolve } = require('path')
const { outputFile, copyFileSync } = require('fs-extra')
const { tossr, inlineScript } = require('tossr')
const { parse } = require('node-html-parser')
const { getConfig } = require('./getConfig')

const ora = require('ora');
const { readFileSync } = require('fs')
let spinner

/** @param {Options} options */
async function start(options) {
    options = await getConfig(options)    
    const queue = new Queue(options.concurrently)
    const hostname = options.host.match(/^https?:\/\/([^/]+)/)[1]
    const originRe = new RegExp(`^(https?:)?\/\/${hostname}`)
    let counter = 0

    if(options.copyEntrypointTo)
        outputFile(options.copyEntrypointTo, readFileSync(options.entrypoint))

    /** @type {Url[]} */
    const urls = (
        Array.isArray(options.sitemap)
            ? [...options.sitemap]
            : require(resolve(process.cwd(), options.sitemap))
    ).map(path => ({ path }))

    spinner = ora({ interval: 20 }).start()

    /** @param {Url} url */
    const short = url => url.path.replace(/\/index$/, '')

    /** @param {Url} url */
    const isUnique = url => !urls.find(oldUrl => short(url) === short(oldUrl))

    /** @param {Url} url */
    const isntBlacklisted = url =>
        !options.blacklist.some(e => {
            if (typeof e == "string") {
                return e == url.path;
            } else if (e instanceof RegExp) {
                return e.test(url.path);
            } else {
                console.warn("config option 'blacklist' should contain only strings and/or regular expressions");
                return true; // Ignore non string or regex backlist item 
            }
        })

    /** @param {Url} url */
    const isValidPath = url =>
        // we don't want `mailto:mail.example.com` or `http://example.com` 
        !url.path.match(/^[a-z0-9]+\:/)
        // or `//example.com`
        && !url.path.startsWith('//')

    /** @param {Url} url */
    const hrefToPath = url => ({ ...url, path: url.path.replace(originRe, '') })

    /** @param {Url} parent */
    const normalize = parent => url => {
        url.path = url.path
            .replace(originRe, '')
            .replace(/^([^/].*)/, `${parent.path}/$1`) // if path is relative, path = parent.path + / + path
            .replace(/^\/$/, '/index') // root should be named index
            .replace(/#.*/, '') // discard anything after a #
            .replace(/\/$/, '') // remove trailing slashes

        return url
    }

    const afterSave = {}
    const saveUrlToHtml = createSaveUrlToHtml(options, afterSave)

    if (options.inlineDynamicImports)
        await inlineScript(options.script)
    processUrls(urls)

    /** @param {Url[]} _urls */
    function processUrls(_urls, depth = 0) {
        _urls
            .filter(isntBlacklisted)
            .forEach((url) => {
                queue.push(async () => {
                    counter++
                    spinner.text = `Exporting ${counter} of ${urls.length} ${url.path}`
                    url.children = await saveUrlToHtml(url.path)

                    if (depth < options.depth) {
                        const newUrls = url.children
                            .map(hrefToPath)
                            .filter(isValidPath)
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
    if (afterSave.saveRootIndex)
        await afterSave.saveRootIndex()
    spinner.succeed(`Exported ${counter} pages (${urls.length - counter} ignored) from total ${urls.length} pages in ${Date.now() - time} ms`)

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
function createSaveUrlToHtml(options, afterSave) {
    const { entrypoint, script, outputDir, forceIndex, eventName, host, ssrOptions, inlineDynamicImports } = options

    /** @param {string} url */
    return async function saveUrlToHtml(url) {
        const html = await tossr(entrypoint, script, url, { silent: true, eventName, host, inlineDynamicImports, ...ssrOptions })
        const suffix = forceIndex && !url.endsWith('/index') ? '/index' : ''
        const saveRootIndex = () => outputFile(`${outputDir + url + suffix}.html`, html)
        if (url !== '/index')
            await saveRootIndex()
        else afterSave.saveRootIndex = saveRootIndex
        const dom = parse(html)
        return dom.querySelectorAll('a')
            .filter(s => s.attributes.href)
            .map(s => ({ path: s.attributes.href }))
    }
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