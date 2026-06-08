import { ReportTemplate } from "@/common/constants"
import { queryOptions } from "@tanstack/react-query"
import { generateReportTemplatePdfFn } from "./services"

export const reportTemplatePdfQueryKeys = {
  all: () => ["report-templates-pdf"] as const,
  template: (template: ReportTemplate) =>
    [...reportTemplatePdfQueryKeys.all(), template] as const,
} as const

export const reportTemplatePdfQueryOptions = (template: ReportTemplate) =>
  queryOptions({
    queryKey: reportTemplatePdfQueryKeys.template(template),
    queryFn: async () => {
      return await generateReportTemplatePdfFn({ data: { template } })
      // const response = await generateReportTemplatePdfFn({ data: { template } })

      // // return await response.arrayBuffer()
      // const buffer= await response.arrayBuffer()
      // return new Uint8Array(buffer)

    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
