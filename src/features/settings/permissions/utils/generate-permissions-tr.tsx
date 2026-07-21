import { SystemPermissions } from "@/features/auth/permissions"
import { TFunction } from "@/i18n"

export function generatePermissionTranslations(tr: TFunction) {
  const permissions = Object.values(SystemPermissions)
  const keys = new Set(permissions.flatMap((p) => Object.keys(p)))
  const translations: Record<string, string> = {}
  const modules = Object.keys(SystemPermissions)
//   for (let module of modules) {
//     translations[module] = tr(`permissions.modules.${module}`)
//   }
  for (let key of Array.from(keys)) {
    const trans = tr(`permissions.${key}`)
    translations[key] = trans.includes(":") ? "" : trans
  }
  return translations
}
