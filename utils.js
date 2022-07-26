import fse from 'fs-extra'
const { existsSync } = fse
/**
 * returns first path that exists
 * @param {string[]} paths
 */
export const findFirstPath = paths => {
    for (const path of paths) if (existsSync(path)) return path
}

export const isNotIn = array => item => array.indexOf(item) === -1
export const isUnique = (item, index, array) => array.indexOf(item) === index
