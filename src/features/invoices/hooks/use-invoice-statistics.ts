import { useQuery } from "@tanstack/react-query"
import { invoiceStatisticsQueryOptions } from "../query-options"

export function useInvoiceStatistics() {
  const { isLoading, data, error, isFetching } = useQuery({
    ...invoiceStatisticsQueryOptions(),
  })

  return { isLoading, data: data?.data, error, isFetching }
}
