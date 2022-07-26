import { configent } from 'configent'

import defaults from './defaults.js'

export const getConfig = async input => {
    return {
        ...defaults,
        ...await configent({ useDetectDefaults: true }),
        ...input,
    }
}
