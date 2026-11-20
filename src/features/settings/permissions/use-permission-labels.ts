import { useCallback } from "react"
import { useTranslations } from "use-intl"

/** "config:roles:create" → "Roles create", for keys with no translation. */
function humanize(key: string) {
  const words = key.split(":").slice(1).join(" ").replace(/_/g, " ").trim()
  const text = words || key
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Translated names for permission modules and named permissions. */
export function usePermissionLabels() {
  const t = useTranslations("permissions")

  const moduleLabel = useCallback(
    (module: string) => {
      const key = `modules.${module}`
      return t.has(key) ? t(key) : humanize(`x:${module}`)
    },
    [t]
  )

  const keyLabel = useCallback(
    (key: string) => (t.has(key) ? t(key) : humanize(key)),
    [t]
  )

  return { moduleLabel, keyLabel }
}
