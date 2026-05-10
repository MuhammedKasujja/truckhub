import z from "zod"

export type Locale = keyof typeof appSupportedLocales

export const appSupportedLocales = {
  en: "English",
  de: "Deutsch",
} as const

export const supportedLocales = Object.entries(appSupportedLocales).map(
  ([key, value]) => ({
    value: key as Locale,
    label: value,
  })
)

export const LocaleSchema = z.object({
  locale: z.enum(Object.keys(appSupportedLocales) as Locale[]),
})

export const defaultLocale = "en"
