const { configent } = require('configent')

const defaults = require('./defaults')

const getConfig = async input => {    
    const opts = configent({...defaults, ...input, useDetectDefaults: true, module})
    return opts
}

module.exports = { getConfig }