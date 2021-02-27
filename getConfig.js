const { configent } = require('configent')

const defaults = require('./defaults')

const getConfig = async input => {    
    return configent(defaults, input, {useDetectDefaults: true, module})
}

module.exports = { getConfig }