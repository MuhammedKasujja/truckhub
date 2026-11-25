import { createServerFn } from "@tanstack/react-start"
import { ComposeEmailSchema, ComposePreviewSchema } from "../schemas"
import { composeEmail, previewComposedEmail } from "./server"
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const composeEmailFn = createServerFn({ method: "POST" })
  .validator(ComposeEmailSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(composeEmail(data))
    return { data: result.data, message: result.message }
  })

export const previewComposedEmailFn = createServerFn({ method: "POST" })
  .validator(ComposePreviewSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(previewComposedEmail(data))
    return { data: result.data, message: result.message }
  })
