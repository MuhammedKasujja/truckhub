import { EntityId } from "@/types"
import { CustomerListSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import { getCustomerDetailsById, getCustomers } from "./service"

export const clientsQueryOptions = (input: CustomerListSearchParams) =>
  queryOptions({
    queryKey: ["clients", "list", input],
    queryFn: () => getCustomers({ data: input }),
  })

export const clientQueryOptions = (customerId: EntityId) =>
  queryOptions({
    queryKey: ["client-details", customerId],
    queryFn: () => getCustomerDetailsById(customerId),
  })
