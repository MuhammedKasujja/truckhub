import { EntityId } from "@/schemas"
import { getAuditLogsFn } from "./services"
import { AuditLogSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"

export const auditLogsQueryKeys = {
  all: () => ["audit-logs"],
  details: (id: EntityId) => [...auditLogsQueryKeys.all(), "detail", id],
}

export const createAuditLogsQueryOptions = (search: AuditLogSearchParams) => {
  return queryOptions({
    queryKey: [...auditLogsQueryKeys.all(), search],
    queryFn: () => getAuditLogsFn({ data: search }),
  })
}
