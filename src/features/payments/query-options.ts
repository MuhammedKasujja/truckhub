import { PaymentListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import { getPaymentsFn, getPaymentsStatisticsFn } from "./services"

export const paymentsQueryKeys = {
  all: () => ["payments"],
  list: () => [...paymentsQueryKeys.all(), "list"],
  details: () => [...paymentsQueryKeys.all(), "detail"],
  statistics: () => [...paymentsQueryKeys.all(), "statistics"],
  detail: (id: string) => [...paymentsQueryKeys.details(), id],
}

export const paymentsQueryOptions = (search: PaymentListSearchParams) =>
  queryOptions({
    queryKey: [...paymentsQueryKeys.list(), search],
    queryFn: () => getPaymentsFn({ data: search }),
  })

export const paymentStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: paymentsQueryKeys.statistics(),
    queryFn: () => getPaymentsStatisticsFn(),
  })
