const { existsSync, readdirSync } = require('fs-extra')
const { resolve } = require('path')
const chalk = require('chalk')
const ora = require('ora')
let spinner

const CONFIG = 'spank.config.js'
const defaults = require('./defaults')

async function getConfig() {
    Object.assign(defaults, await getFrameworkConfig(), await getUserConfig())
    return defaults
}

async function getFrameworkConfig() {
    spinner = ora('Looking for matching config').start()

    const pkgjson = { dependencies: {}, devDependencies: {} };
    if (existsSync('package.json')) {
        Object.assign(pkgjson, require(resolve(process.cwd(), 'package.json')));
    }

    Object.assign(pkgjson.dependencies, pkgjson.devDependencies)

    const configFiles = readdirSync(resolve(__dirname, 'configs'))

    const promises = configFiles.map(async file => {
        const { condition, config, name, supersedes } = require(`./configs/${file}`)
        if (condition({ pkgjson })) {
            spinner.text = 'Found matching config: ' + chalk.magentaBright(name)

            return await {
                config: config(),
                supersedes,
                name,
                file: file.replace(/\.config\..+/, '')
            }
        }
    })

    const allResolvedConfigs = (await Promise.all(promises)).filter(Boolean)
    const supersedings = [].concat(...allResolvedConfigs.map(conf => conf.supersedes).filter(Boolean))
    const resolvedConfigs = allResolvedConfigs.filter(conf => !supersedings.includes(conf.file))

    if (resolvedConfigs.length) {
        const names = resolvedConfigs.map(conf => conf.name)
        const configs = resolvedConfigs.map(conf => conf.config)
        const config = Object.assign({}, ...configs)
        spinner.succeed('Found matching config: ' + chalk.magentaBright(names.join(', ')))
        return config
    } else {
        spinner.info('Found no matching config. While one isn\'t required, We would greatly appreciate if you reach out to us. https://github.com/roxiness/spank')
        return {}
    }
}

async function getUserConfig() {
    spinner = ora('Looking for user config').start()
    if (existsSync(CONFIG)) {
        spinner.succeed('found user config: ' + CONFIG)
        return require(resolve(process.cwd(), CONFIG))
    } else
        spinner.stop()
}


module.exports = { getConfig, defaults }