import { EntityId } from "@/schemas"
import { getAuditLogsFn } from "./services"
import { AuditLogSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"

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
