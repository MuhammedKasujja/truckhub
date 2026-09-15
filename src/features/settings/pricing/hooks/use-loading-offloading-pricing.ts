import { useQuery } from "@tanstack/react-query"
import { createCompanyLoadingFreesQueryOptions } from "../query-options"

export function useCompanyLoadingFees() {
  const { data, isLoading, error } = useQuery(
    createCompanyLoadingFreesQueryOptions()
  )

  return { isLoading, data: data?.data, error }
}
