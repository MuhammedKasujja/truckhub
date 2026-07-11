import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

import z from "zod"
import { AuditLog } from "./types"
import { IDSchema } from "@/schemas"
import { DefaultSearchParamsSchema } from "@/common/schemas"

export const AuditLogSearchParamsCache = z.object({
  user_ids: z.array(IDSchema).default([]).optional(),
  sort: getSortingStateSchema<AuditLog>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema<AuditLog>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export const deleteLogsSchema = z.object({
  log_ids: z.array(IDSchema).default([]),
})

export type AuditLogSearchParams = z.infer<typeof AuditLogSearchParamsCache>

export type DeleteLogsRequest = z.infer<typeof deleteLogsSchema>
