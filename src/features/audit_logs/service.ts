"use server"

import * as apiClient from "@/lib/api-client"
import { AuditLog } from "@/features/audit_logs/types"
import { createServerFn } from "@tanstack/react-start"
import { generateApiSearchParams } from "@/lib/search-params"
import { AuditLogSearchParamsCache } from "@/features/audit_logs/schemas"

const endpoint = "/v1/audit-logs"

export const getAuditLogsFn = createServerFn()
  .inputValidator((data) => AuditLogSearchParamsCache.parse(data))
  .handler(async ({ data: input }) => {
    const { page, perPage } = input
    const params = generateApiSearchParams(input)

    const {
      data,
      isSuccess,
      error,
      pagination: paginator,
    } = await apiClient.getPaginatedFn<AuditLog[]>(`${endpoint}?${params}`)

    const pagination = paginator ?? { page, perPage, totalPages: 0, total: 0 }
    return { data: isSuccess ? data! : [], error, pagination }
  })
