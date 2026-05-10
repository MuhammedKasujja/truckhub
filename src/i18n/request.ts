// import { getUserLocale } from "@/server/locale"
import { createServerFn } from "@tanstack/react-start"

export const getTranslationsData = createServerFn({ method: "GET" }).handler(async () => {
  const locale = "en" // detect from cookie/header/URL
  const messages = (await import(`./messages/${locale}/index.ts`)).default
  return { locale, messages }
})
