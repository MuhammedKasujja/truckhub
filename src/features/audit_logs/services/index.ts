import { createServerFn } from "@tanstack/react-start"
import { deleteAuditLogs, getAuditLogDetails, getAuditLogs } from "./server"
import {
  deleteLogsSchema,
  AuditLogSearchParamsCache,
} from "@/features/audit_logs/schemas"
import { EntityIdSchema } from "@/schemas"

export const getAuditLogsFn = createServerFn()
  .inputValidator(AuditLogSearchParamsCache)
  .handler(async ({ data }) => {
    return getAuditLogs(data)
  })

export const getAuditLogDetailsFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getAuditLogDetails(data.id)
  })

export const deleteAuditLogsFn = createServerFn()
  .inputValidator(deleteLogsSchema)
  .handler(async ({ data }) => {
    return deleteAuditLogs(data)
  })
