import { queryOptions } from "@tanstack/react-query"
import { getEmailTemplateCatalogFn, getEmailTemplatesFn } from "./services"

export const emailTemplateQueryKeys = {
  all: () => ["email-templates"] as const,
  catalog: () => [...emailTemplateQueryKeys.all(), "catalog"] as const,
  list: () => [...emailTemplateQueryKeys.all(), "list"] as const,
} as const

/** The variables each system template offers. Changes only with a backend release. */
export const emailTemplateCatalogQueryOptions = () =>
  queryOptions({
    queryKey: emailTemplateQueryKeys.catalog(),
    queryFn: () => getEmailTemplateCatalogFn(),
    staleTime: 30 * 60 * 1000,
  })

/** Every template with its subject, HTML and editor design, so no per-key fetch is needed. */
export const emailTemplatesQueryOptions = () =>
  queryOptions({
    queryKey: emailTemplateQueryKeys.list(),
    queryFn: () => getEmailTemplatesFn(),
    gcTime: 5 * 60 * 1000,
  })
