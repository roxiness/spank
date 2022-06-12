const { existsSync } = require('fs-extra')
/**
 * returns first path that exists
 * @param {string[]} paths
 */
const findFirstPath = paths => {
    for (const path of paths) if (existsSync(path)) return path
}

const isNotIn = array => item => array.indexOf(item) === -1
const isUnique = (item, index, array) => array.indexOf(item) === index

module.exports = { findFirstPath, isNotIn, isUnique }
