import { queryOptions } from "@tanstack/react-query"

export const quotationQueryKeys = {
  all: () => ["quotation"],
  list: () => [...quotationQueryKeys.all(), "list"],
  search: (search?: string) => [...quotationQueryKeys.all(), "search", search],
  detail: (id: string) => [...quotationQueryKeys.all(), "detail", id],
}

export const quotationQueryOptions = (search) =>
  queryOptions({
    queryKey: [...quotationQueryKeys.list(), search],
    queryFn: () => [],
  })
