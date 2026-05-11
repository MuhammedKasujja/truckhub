import { EntityId } from "@/types"
import { CustomerListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import { getClientProfileFn, getCustomersFn } from "./services"

export const clientsQueryOptions = (input: CustomerListSearchParams) =>
  queryOptions({
    queryKey: ["clients", "list", input],
    queryFn: () => getCustomersFn({ data: input }),
  })

export const clientQueryOptions = (customerId: EntityId) =>
  queryOptions({
    queryKey: ["client-details", customerId],
    queryFn: () => getClientProfileFn({ data: { id: customerId } }),
  })
