//  @ts-check

import pluginQuery from '@tanstack/eslint-plugin-query'
import { tanstackConfig } from "@tanstack/eslint-config"

export default [
    ...tanstackConfig,
    ...pluginQuery.configs['flat/recommended-strict']
]
