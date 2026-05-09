import * as z from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

// const UserThemeSchema = z.enum(['light', 'dark', 'system']).catch('system');

const postThemeValidator = z.union([z.literal('system'),z.literal('light'), z.literal('dark')])
export type Theme = z.infer<typeof postThemeValidator>
const storageKey = '_preferred-theme'

export const getThemeServerFn = createServerFn().handler(
  async () => (getCookie(storageKey) || 'light') as Theme,
)

export const setThemeServerFn = createServerFn({ method: 'POST' })
  .inputValidator(postThemeValidator)
  .handler(async ({ data }) => setCookie(storageKey, data))
