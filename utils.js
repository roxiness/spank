const { existsSync } = require('fs-extra')
/**
 * returns first path that exists
 * @param {string[]} paths
 */
const findFirstPath = paths => {
    for (const path of paths) if (existsSync(path)) return path
}

module.exports = { findFirstPath }
