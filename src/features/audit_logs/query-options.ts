import { EntityId } from "@/schemas"
import { AuditLogSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"
import { getAuditLogDetailsFn, getAuditLogsFn } from "./services"

export const auditLogsQueryKeys = {
  list: () => ["audit-logs"],
  details: (id: EntityId) => [...auditLogsQueryKeys.list(), "detail", id],
}

export const createAuditLogsQueryOptions = (search: AuditLogSearchParams) => {
  return queryOptions({
    queryKey: [...auditLogsQueryKeys.list(), search],
    queryFn: () => getAuditLogsFn({ data: search }),
  })
}

export const createAuditLogsDetailsQueryOptions = (id: EntityId) => {
  return queryOptions({
    queryKey: auditLogsQueryKeys.details(id),
    queryFn: () => getAuditLogDetailsFn({ data: { id } }),
  })
}
