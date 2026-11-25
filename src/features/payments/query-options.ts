import { PaymentListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import {
  getPaymentDetailsFn,
  getPaymentsFn,
  getPaymentsStatisticsFn,
} from "./services"
import type { EntityId } from "@/schemas"

export const paymentsQueryKeys = {
  all: () => ["payments"],
  list: () => [...paymentsQueryKeys.all(), "list"],
  details: () => [...paymentsQueryKeys.all(), "detail"],
  statistics: () => [...paymentsQueryKeys.list(), "statistics"],
  detail: (id: EntityId) => [...paymentsQueryKeys.details(), id],
} as const

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

export const paymentDetailsQueryOptions = (id: EntityId) =>
  queryOptions({
    queryKey: paymentsQueryKeys.detail(id),
    queryFn: () => getPaymentDetailsFn({ data: { id } }),
  })
