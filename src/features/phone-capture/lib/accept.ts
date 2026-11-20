/**
 * Checks a file against an `accept` string such as ".jpg,.png,application/pdf"
 * or "image/*", the same way the browser's file picker reads it.
 */
export function matchesAccept(
  file: { name: string; type: string },
  accept: string
) {
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
  if (rules.length === 0) return true

  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()

  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule)
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

/** True when the accept list allows at least one image type. */
export function acceptsImages(accept: string) {
  return /(^|,)\s*(image\/|\.(jpe?g|png|webp|heic|heif|gif)\b)/i.test(accept)
}
