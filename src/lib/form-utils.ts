import { z } from "zod"

const isEmpty = (v: unknown) => v === "" || (v instanceof File && v.size === 0)

/** FormData -> plain object, driven by the schema's keys. */
export function formDataToObject(
  schema: z.ZodObject<any>,
  fd: FormData,
  arrayKeys: string[] = []
) {
  const raw: Record<string, unknown> = {}
  for (const key of Object.keys(schema.shape)) {
    const values = fd.getAll(key).filter((v) => !isEmpty(v))
    raw[key] = arrayKeys.includes(key) ? values : values[0]
  }
  return raw
}

/** Plain object -> FormData (skips empty values, repeats keys for arrays). */
export function objectToFormData(obj: Record<string, unknown>) {
  const fd = new FormData()
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || isEmpty(value)) continue
    if (Array.isArray(value)) value.forEach((v) => fd.append(key, v))
    else if (value instanceof File) fd.append(key, value, value.name)
    else fd.append(key, String(value))
  }
  return fd
}

function fail(fieldErrors: Record<string, string[]>, message?: string): never {
  throw new Error(JSON.stringify({ fieldErrors, message }))
}

/** Use as .inputValidator(formInput(schema)). */
export function formInput<S extends z.ZodObject<any>>(
  schema: S,
  opts: { arrayKeys?: string[] } = {}
) {
  return (input: unknown): z.output<S> => {
    if (!(input instanceof FormData)) throw new Error("Expected FormData")
    const result = schema.safeParse(
      formDataToObject(schema, input, opts.arrayKeys)
    )
    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "root")
        ;(fieldErrors[key] ??= []).push(issue.message)
      }
      fail(fieldErrors, "Validation failed")
    }
    return result.data
  }
}
