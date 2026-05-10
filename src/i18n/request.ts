import { LocaleSchema, defaultLocale } from "./config"
import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"

const COOKIE_LOCALE = "app-locale"

export const getTranslationsData = createServerFn({ method: "GET" }).handler(
  async () => {
    const locale = getCookie(COOKIE_LOCALE) ?? defaultLocale
    const messages = (await import(`./messages/${locale}/index.ts`)).default
    return { locale, messages }
  }
)

export const setAppLocale = createServerFn({ method: "POST" })
  .inputValidator((data) => LocaleSchema.parse(data))
  .handler(({ data }) => {
    setCookie(COOKIE_LOCALE, data.locale)
  })
