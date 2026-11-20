import { createServerFn } from "@tanstack/react-start"
import { deleteAuditLogs, getAuditLogDetails, getAuditLogs } from "./server"
import {
  AuditLogSearchParamsCache,
  deleteLogsSchema,
} from "@/features/audit_logs/schemas"
import { ApiError } from "@/types"
import { EntityIdSchema } from "@/schemas"

export const getAuditLogsFn = createServerFn()
  .validator(AuditLogSearchParamsCache)
  .handler(async ({ data }) => {
    const response = await getAuditLogs(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const getAuditLogDetailsFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getAuditLogDetails(data.id)
  })

export const deleteAuditLogsFn = createServerFn()
  .validator(deleteLogsSchema)
  .handler(async ({ data }) => {
    return deleteAuditLogs(data)
  })
