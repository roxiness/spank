const { configent } = require('configent')

const defaults = require('./defaults')

const getConfig = async input => {
    return { ...defaults, ...configent({ useDetectDefaults: true, module }), ...input }
}

module.exports = { getConfig }
