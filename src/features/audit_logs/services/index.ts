import { getAuditLogs } from "./server"
import { createServerFn } from "@tanstack/react-start"
import { AuditLogSearchParamsCache } from "@/features/audit_logs/schemas"

export const getAuditLogsFn = createServerFn()
  .inputValidator(AuditLogSearchParamsCache)
  .handler(async ({ data }) => {
    return getAuditLogs(data)
  })
