import { ReportTemplate } from "@/common/constants"
import { generateReportTemplatePdfFn } from "../services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  reportTemplatePdfQueryKeys,
  reportTemplatePdfQueryOptions,
} from "../query-options"
import { useEffect, useState } from "react"

export function useReportTemplatePdf(template: ReportTemplate) {
  const queryClient = useQueryClient()

  const [pdfData, setPageData] = useState<Uint8Array>()

  const { data: cachedResponse, isLoading } = useQuery(
    reportTemplatePdfQueryOptions(template)
  )

  const mutation = useMutation({
    mutationFn: () => generateReportTemplatePdfFn({ data: { template } }),
    onSuccess: async (response) => {
      queryClient.setQueryData(
        reportTemplatePdfQueryKeys.template(template),
        response
      )
      createPdfData(response)
    },
  })

  const createPdfData = async (response: Response) => {
    const buffer = await response.arrayBuffer()
    setPageData(new Uint8Array(buffer))
  }

  useEffect(() => {
    if (cachedResponse instanceof Response) {
      createPdfData(cachedResponse)
    }
  }, [cachedResponse])

  function refresh() {
    return mutation.mutate()
  }

  return { isLoading, pdfData, refresh }
}
