import { getAuditLogsFn } from "./services"
import { AuditLogSearchParams } from "./schemas"
import { queryOptions } from "@tanstack/react-query"

export const createAuditLogsQueryOptions = (search: AuditLogSearchParams) =>
  queryOptions({
    queryKey: ["audit-logs"],
    queryFn: () => getAuditLogsFn({ data: search }),
  })
