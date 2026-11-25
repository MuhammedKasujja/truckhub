import { createServerFn } from "@tanstack/react-start"
import {
  EmailTemplateKeySchema,
  EmailTemplatePreviewSchema,
  EmailTemplateUpsertSchema,
} from "../schemas"
import {
  getEmailTemplateCatalog,
  getEmailTemplates,
  previewEmailTemplate,
  resetEmailTemplate,
  saveEmailTemplate,
} from "./server"

export const getEmailTemplateCatalogFn = createServerFn().handler(async () => {
  return await getEmailTemplateCatalog()
})

export const getEmailTemplatesFn = createServerFn().handler(async () => {
  return await getEmailTemplates()
})

export const saveEmailTemplateFn = createServerFn({ method: "POST" })
  .validator(EmailTemplateUpsertSchema)
  .handler(async ({ data }) => {
    return await saveEmailTemplate(data)
  })

export const resetEmailTemplateFn = createServerFn({ method: "POST" })
  .validator(EmailTemplateKeySchema)
  .handler(async ({ data }) => {
    return await resetEmailTemplate(data.key)
  })

export const previewEmailTemplateFn = createServerFn({ method: "POST" })
  .validator(EmailTemplatePreviewSchema)
  .handler(async ({ data }) => {
    return await previewEmailTemplate(data)
  })
