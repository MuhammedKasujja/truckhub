import { getPaymentsFn } from "./services"
import { PaymentListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"

export const paymentsKeys = {
  all: () => ["payments"],
  list: () => [...paymentsKeys.all(), "list"],
  details: () => [...paymentsKeys.all(), "detail"],
  detail: (id: string) => [...paymentsKeys.details(), id],
}

export const paymentsQueryOprions = (search: PaymentListSearchParams) =>
  queryOptions({
    queryKey: [...paymentsKeys.list(), search],
    queryFn: () => getPaymentsFn({ data: search }),
  })
