/** @typedef {import('./defaults')} Options */
/** @typedef {{path: string, children?: Url[]}} Url */

const { resolve } = require('path')
const { outputFile } = require('fs-extra')
const { parse } = require('node-html-parser')
const { getConfig } = require('./getConfig')

const ora = require('ora')
const { readFileSync } = require('fs')
let spinner

const getRenderer = renderer => {
    const resolvers = [
        () => require(`${process.cwd()}`),
        () => require(`${process.cwd()}`).default,
        () => require(`./renderers/${renderer}`)[renderer],
        () => require(renderer)[renderer],
        () => require(renderer).default,
        () => require(renderer),
    ]

    for (const resolver of resolvers)
        try {
            return resolver()
        } catch (_err) {}

    throw new Error(`Could not find renderer: ${renderer}`)
}

/**
 * @param {string | RegExp} str
 * @returns {RegExp}
 */
const makeRegex = str =>
    str instanceof RegExp ? str : new RegExp(`^${str.replace(/\*/, '(.+?)')}$`)

/** @param {Options} options */
async function start(options) {
    options = await getConfig(options)
    
    const blacklist = options.blacklist.map(makeRegex)
    const queue = new Queue(options.concurrently)
    const hostname = options.host?.match(/^https?:\/\/([^/]+)/)[1]
    const originRe = new RegExp(`^(https?:)?\/\/${hostname}`)
    let counter = 0

    if (options.copyTemplateTo)
        outputFile(options.copyTemplateTo, readFileSync(options.template))

    /** @type {string[]} */
    const urls = Array.isArray(options.sitemap)
        ? [...options.sitemap]
        : require(resolve(process.cwd(), options.sitemap))

    spinner = ora({ interval: 20 }).start()

    /** @param {string} url */
    const short = url => url.replace(/\/index$/, '')

    /** @param {string} url */
    const isUnique = url => !urls.find(oldUrl => short(url) === short(oldUrl))

    /** @param {string} url */
    const isntBlacklisted = url => !blacklist.some(e => e.test(url))

    /** @param {string} url */
    const isValidPath = url =>
        // we don't want `mailto:mail.example.com` or `http://example.com`
        !url.match(/^[a-z0-9]+\:/) &&
        // or `//example.com`
        !url.startsWith('//')

    /** @param {string} url */
    const hrefToPath = url => url.replace(originRe, '')

    /** @param {string} parent */
    const normalize = parent => url =>
        url
            .replace(originRe, '')
            .replace(/^\.\//, '') // normalize "./relative" urls to "relative"
            .replace(/^([^/])/, `${parent}/$1`) // prefix all relative urls with their parent
            .replace(/#.*/, '') // discard anything after a #
            .replace(/\/$/, '') // remove trailing slashes

    // this function should get overwritten by processUrls
    let saveRootFile = () => console.warn('[spank] found no root index.html file')

    queue.onDone(() => saveRootFile())

    const renderer = getRenderer(options.renderer)

    /** @param {string[]} _urls */
    const processUrls = (_urls, depth = 0) => {
        _urls.filter(isntBlacklisted).forEach(url => {
            queue.push(async () => {
                counter++
                spinner.text = `Exporting ${counter} of ${urls.length} ${url}`
                const parsedUrl = await parseUrl(url, renderer, options)
                const saveFile = () =>
                    outputFile(`${options.outputDir + parsedUrl.file}`, parsedUrl.html)

                if (parsedUrl.url === '/index') saveRootFile = saveFile
                else await saveFile()

                if (depth < options.depth) {
                    const newUrls = parsedUrl.urls
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

    
    processUrls(urls)

    const time = Date.now()
    await new Promise(resolve => queue.onDone(resolve))
    spinner.succeed(
        `Exported ${counter} pages (${urls.length - counter} ignored) from total ${
            urls.length
        } pages in ${Date.now() - time} ms`,
    )

    if (options.writeSummary) writeSummary(urls, options)
}

/**
 * @param {string[]} urls
 * @param {Options} options
 */
function writeSummary(urls, options) {
    const path = options.writeSummary.toString().replace(/^true$/, 'spank-summary.json')
    outputFile(
        path,
        JSON.stringify(
            {
                time: new Date(),
                options,
                exports: urls.length,
                list: urls,
            },
            null,
            2,
        ),
    )
}
/**
 * returns html, nested urls
 * @param {string} url½
 * @param {(template: string, script: string, url: string, options: any)=>string} renderer
 * @param {Options} options
 * @returns {Promise<{html: string, urls: string[], url: string, file: string}>}
 */
async function parseUrl(url, renderer, options) {
    const { template, script } = options

    const html = await renderer(template, script, url, options.renderOptions)

    const dom = parse(html)
    const urls = dom
        .querySelectorAll('a')
        .filter(s => s.attributes.href)
        .map(s => s.attributes.href)

    return {
        url,
        urls,
        html,
        file: url.replace(/\/index$/, '') + '/index.html',
    }
}

/** @param {number} concurrency */
function Queue(concurrency) {
    /** @type {function[]} */
    const onDoneHooks = []

    /** @type {function[]} */
    const queue = []
    let freeSlots = concurrency
    this.onDone = hook => onDoneHooks.push(hook)
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
            for (const hook of onDoneHooks) await hook()
        }
    }
    return this
}

module.exports = { start }
