import { queryOptions } from "@tanstack/react-query"
import { generateReportTemplatePdfFn } from "./services"
import type { ReportTemplate } from "@/common/constants"

export const reportTemplatePdfQueryKeys = {
  all: () => ["report-templates-pdf"] as const,
  template: (template: ReportTemplate) =>
    [...reportTemplatePdfQueryKeys.all(), template] as const,
} as const

/**
 * The sample PDF for a template, as bytes. The response body is read here so
 * the cache holds plain data rather than a Response, which can be read once.
 */
export const reportTemplatePdfQueryOptions = (template: ReportTemplate) =>
  queryOptions({
    queryKey: reportTemplatePdfQueryKeys.template(template),
    queryFn: async () => {
      const response = await generateReportTemplatePdfFn({ data: { template } })
      return new Uint8Array(await response.arrayBuffer())
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  })
