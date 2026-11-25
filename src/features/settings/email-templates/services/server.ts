import type {
  EmailTemplate,
  EmailTemplateCatalogEntry,
  RenderedEmail,
} from "../types"
import type {
  EmailTemplatePreviewInput,
  EmailTemplateUpsertInput,
} from "../schemas"
import * as apiClient from "@/lib/api-client"

const endpoint = "v1/email-templates"

const templateUrl = (key: string) => `${endpoint}/${encodeURIComponent(key)}`

export async function getEmailTemplateCatalog() {
  return await apiClient.getFn<EmailTemplateCatalogEntry[]>(`${endpoint}/catalog`)
}

/** Every catalog template (the company's version or the default) plus custom ones. */
export async function getEmailTemplates() {
  return await apiClient.getFn<EmailTemplate[]>(endpoint)
}

export async function saveEmailTemplate(data: EmailTemplateUpsertInput) {
  const { key, ...body } = data
  return await apiClient.putFn<EmailTemplate>(templateUrl(key), body)
}

/** Deletes the company's version; catalog templates go back to the default. */
export async function resetEmailTemplate(key: string) {
  return await apiClient.deleteFn(templateUrl(key))
}

export async function previewEmailTemplate(data: EmailTemplatePreviewInput) {
  return await apiClient.postFn<RenderedEmail>(`${endpoint}/preview`, data)
}
