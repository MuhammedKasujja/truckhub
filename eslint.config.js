//  @ts-check

import pluginQuery from '@tanstack/eslint-plugin-query'
import { tanstackConfig } from "@tanstack/eslint-config"

const patchedTanstackConfig = tanstackConfig.map((cfg) => {
    if (cfg.rules?.['@typescript-eslint/array-type']) {
        return {
            ...cfg,
            rules: {
                ...cfg.rules,
                '@typescript-eslint/array-type': ['error', { default: 'array' }],
            },
        }
    }
    return cfg
})

export default [
    ...patchedTanstackConfig,
    ...pluginQuery.configs['flat/recommended-strict']
]
