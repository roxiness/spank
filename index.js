/** @typedef {import('./defaults')} Options */
/** @typedef {{path: string, children?: Url[]}} Url */

import { resolve } from 'path'
import { outputFile } from 'fs-extra'
import { parse } from 'node-html-parser'
import { getConfig } from './getConfig.js'

import ora from 'ora'
import { readFileSync } from 'fs'
import { isNotIn, isUnique } from './utils.js'
let spinner

const getRenderer = async renderer => {
    const resolvers = [
        // builtin renderers
        () => import(`./renderers/${renderer}.js`).then(r => r[renderer]),
        () => import(`./renderers/${renderer}.js`).then(r => r.default),
        // user renderers
        () =>
            import(`file:///${process.cwd()}/renderers/${renderer}`).then(
                r => r[renderer],
            ),
        () =>
            import(`file:///${process.cwd()}/renderers/${renderer}`).then(r => r.default),
        // modules
        () => import(renderer).then(r => r[renderer]),
        () => import(renderer).then(r => r.default),
        () => import(renderer),
    ]

    for (const resolver of resolvers)
        try {
            const res = await resolver()
            if (res) return res
        } catch (_err) {
            if (!_err.message.startsWith('Cannot find module')) throw _err
        }

    throw new Error(`Could not find renderer: ${renderer}`)
}

/** @param {string} url */
const isValidPath = url =>
    // we don't want `mailto:mail.example.com` or `http://example.com`
    !url.match(/^[a-z0-9]+\:/) &&
    // or `//example.com`
    !url.startsWith('//')

const hrefToPath = originRe => url => url.replace(originRe, '')

/**
 * @param {string | RegExp} str
 * @returns {RegExp}
 */
const makeRegex = str =>
    str instanceof RegExp ? str : new RegExp(`^${str.replace(/\*/, '(.+?)')}$`)

/** @param {Options['default']} options */
export async function start(options) {
    options = await getConfig(options)

    const blacklist = options.blacklist.map(makeRegex)
    const queue = new Queue(options.concurrently)
    const hostname = options.host?.match(/^https?:\/\/([^/]+)/)[1]
    const originRe = new RegExp(`^(https?:)?\/\/${hostname}`)
    let counter = 0

    if (options.copyTemplateTo)
        outputFile(options.copyTemplateTo, readFileSync(options.template))

    /** @param {string} parent */
    const normalize = parent => url =>
        url
            .replace(originRe, '')
            .replace(/^\.\//, '') // normalize "./relative" urls to "relative"
            .replace(/^([^/])/, `${parent}/$1`) // prefix all relative urls with their parent
            .replace(/#.*/, '') // discard anything after a #
            .replace(/\/*$/, '') // remove trailing slashes
            .replace(/\/index$/, '') // remove index

    /** @type {string[]} */
    const rawUrls = Array.isArray(options.sitemap)
        ? [...options.sitemap]
        : await import('file:///' + resolve(options.sitemap)).then(r => r.default)

    const urls = rawUrls.map(normalize(''))

    spinner = ora({ interval: 20 }).start()

    /** @param {string} url */
    const isntBlacklisted = url => !blacklist.some(e => e.test(url))

    // this function should get overwritten by processUrls
    let saveRootFile = () => console.warn('[spank] found no root index.html file')

    queue.onDone(() => saveRootFile())

    const renderer = await getRenderer(options.renderer)

    /** @param {string[]} _urls */
    const processUrls = (_urls, depth = 0) => {
        _urls.filter(isntBlacklisted).forEach(url => {
            queue.push(async () => {
                counter++
                spinner.text = `Exporting ${counter} of ${urls.length} ${url}`
                const parsedUrl = await parseUrl(url, renderer, options)
                const saveFile = () =>
                    outputFile(`${options.outputDir + parsedUrl.file}`, parsedUrl.html)

                if (parsedUrl.url === '') saveRootFile = saveFile
                else await saveFile()

                if (depth < options.depth) {
                    const newUrls = parsedUrl.urls
                        .map(hrefToPath(originRe))
                        .filter(isValidPath)
                        .map(normalize(url))
                        .filter(isntBlacklisted)
                        .filter(isNotIn(urls))
                        .filter(isUnique)
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
        `[spank] Exported ${counter} pages (${
            urls.length - counter
        } ignored) from total ${urls.length} pages in ${Date.now() - time} ms`,
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
        file: url + '/index.html',
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
