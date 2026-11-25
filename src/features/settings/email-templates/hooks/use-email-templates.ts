import { toast } from "sonner"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import {
  previewEmailTemplateFn,
  resetEmailTemplateFn,
  saveEmailTemplateFn,
} from "../services"
import {
  emailTemplateCatalogQueryOptions,
  emailTemplatesQueryOptions,
} from "../query-options"
import type {
  EmailTemplatePreviewInput,
  EmailTemplateUpsertInput,
} from "../schemas"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

/** The API's code for a template that can't be parsed or uses unknown variables. */
export const INVALID_TEMPLATE_CODE = "INVALID_EMAIL_TEMPLATE"

export function useEmailTemplates() {
  const { data } = useSuspenseQuery(emailTemplatesQueryOptions())
  return {
    templates: data.isSuccess ? (data.data ?? []) : [],
    error: data.isSuccess ? undefined : data.error,
  }
}

export function useEmailTemplateCatalog() {
  const { data } = useSuspenseQuery(emailTemplateCatalogQueryOptions())
  return { catalog: data.isSuccess ? (data.data ?? []) : [] }
}

/**
 * Saves a template. Validation errors (bad syntax, unknown variables) are left
 * on `mutation.data.error` for the editor to show next to the fields.
 */
export function useSaveEmailTemplate({
  successMessage = "Email template saved",
}: { successMessage?: string } = {}) {
  const invalidator = useQueryInvalidator()
  return useMutation({
    mutationFn: (input: EmailTemplateUpsertInput) =>
      saveEmailTemplateFn({ data: input }),
    onSuccess: ({ isSuccess, error }) => {
      if (!isSuccess) {
        if (error?.code !== INVALID_TEMPLATE_CODE) {
          toast.error(error?.message ?? "Couldn't save the template")
        }
        return
      }
      toast.success(successMessage)
      invalidator.emailTemplates.list.invalidate()
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useResetEmailTemplate() {
  const invalidator = useQueryInvalidator()
  return useMutation({
    mutationFn: (key: string) => resetEmailTemplateFn({ data: { key } }),
    onSuccess: ({ isSuccess, error }) => {
      if (!isSuccess) {
        toast.error(error?.message ?? "Couldn't reset the template")
        return
      }
      toast.success("Email template reset")
      invalidator.emailTemplates.list.invalidate()
    },
    onError: (error) => toast.error(error.message),
  })
}

/** Renders unsaved editor content with sample values. */
export function usePreviewEmailTemplate() {
  return useMutation({
    mutationFn: (input: EmailTemplatePreviewInput) =>
      previewEmailTemplateFn({ data: input }),
    onSuccess: ({ isSuccess, error }) => {
      if (!isSuccess && error?.code !== INVALID_TEMPLATE_CODE) {
        toast.error(error?.message ?? "Couldn't render the preview")
      }
    },
    onError: (error) => toast.error(error.message),
  })
}
