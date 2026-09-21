import { queryOptions } from "@tanstack/react-query"
import { getBankAccountsFn, getBanksFn } from "./services"

export const banksQueryKeys = {
  all: () => ["banks"],
  list: () => [...banksQueryKeys.all(), "list"],
  details: () => [...banksQueryKeys.all(), "detail"],
  detail: (id: string) => [...banksQueryKeys.details(), id] as const,
} as const

export const bankAccountsQueryKeys = {
  all: () => ["bank-accounts"],
  list: () => [...bankAccountsQueryKeys.all(), "list"],
  details: () => [...bankAccountsQueryKeys.all(), "detail"],
  detail: (id: string) => [...bankAccountsQueryKeys.details(), id] as const,
} as const

export const bankAccountsListQueryOptions = () =>
  queryOptions({
    queryKey: bankAccountsQueryKeys.list(),
    queryFn: () => getBankAccountsFn(),
  })

export const banksListQueryOptions = () =>
  queryOptions({
    queryKey: banksQueryKeys.list(),
    queryFn: () => getBanksFn(),
  })
