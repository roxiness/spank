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
    const matches = []
    
    spinner = ora('Looking for matching config').start()
    
    const pkgjson = existsSync('package.json')
        ? require(resolve(process.cwd(), 'package.json'))
        : { dependencies: {}, devDependencies: {} }
    Object.assign(pkgjson.dependencies, pkgjson.devDependencies)

    const configFiles = readdirSync(resolve(__dirname, 'configs'))    
    
    const promises = configFiles.map(async file => {
        const { condition, config, name } = require(`./configs/${file}`)
        if (condition({ pkgjson })) {
            spinner.text = 'Found matching config: ' + chalk.magentaBright(name)
            matches.push(name)
            return await config()
        }
    })

    if (matches.length)
        spinner.succeed('Found matching config: ' + chalk.magentaBright(matches.join(', ')))
    else spinner.info('Found no matching config. While one isn\'t required, We would greatly appreciate if you reach out to us. https://github.com/roxiness/spank')

    const configs = await Promise.all(promises)
    const config = Object.assign({}, ...configs)

    return config
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