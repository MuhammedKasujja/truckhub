import { PaymentListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import { getPaymentsFn, getPaymentsStatisticsFn } from "./services"

export const paymentsKeys = {
  all: () => ["payments"],
  list: () => [...paymentsKeys.all(), "list"],
  details: () => [...paymentsKeys.all(), "detail"],
  statistics: () => [...paymentsKeys.all(), "statistics"],
  detail: (id: string) => [...paymentsKeys.details(), id],
}

export const paymentsQueryOptions = (search: PaymentListSearchParams) =>
  queryOptions({
    queryKey: [...paymentsKeys.list(), search],
    queryFn: () => getPaymentsFn({ data: search }),
  })

export const paymentStatisticsQueryOptions = () =>
  queryOptions({
    queryKey: paymentsKeys.statistics(),
    queryFn: () => getPaymentsStatisticsFn(),
  })
