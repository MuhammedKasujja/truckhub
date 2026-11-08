import type { ZodType } from "zod"
import type { DriverCreateSchemaType } from "./schemas"

/** A driver request: all or part of the body, files included. */
type DriverRequest = Partial<DriverCreateSchemaType> & { id?: string }

const FIELDS_PART = "fields"

/**
 * Browser to server function. The fields travel as one JSON part beside the
 * files, so numbers, booleans and nested fields keep their types.
 */
export function toDriverRequestFormData(request: DriverRequest) {
  const fd = new FormData()
  const fields: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(request)) {
    if (value instanceof File) fd.append(key, value, value.name)
    else fields[key] = value
  }
  fd.append(FIELDS_PART, JSON.stringify(fields))
  return fd
}

/** Use as .inputValidator(driverRequestInput(schema)). */
export function driverRequestInput<T>(schema: ZodType<T>) {
  return (input: unknown): T => {
    if (!(input instanceof FormData)) throw new Error("Expected FormData")
    const files = [...input.entries()].filter(([key]) => key !== FIELDS_PART)
    return schema.parse({
      ...JSON.parse(String(input.get(FIELDS_PART))),
      ...Object.fromEntries(files),
    })
  }
}

/**
 * Server function to API. One part per field: files as files, nested
 * fields as JSON strings, and everything else as text.
 */
export function toDriverApiFormData(fields: Record<string, unknown>) {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue
    if (value instanceof File) fd.append(key, value, value.name)
    else if (typeof value === "object") fd.append(key, JSON.stringify(value))
    else fd.append(key, String(value))
  }
  return fd
}
