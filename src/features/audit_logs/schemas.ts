import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

import z from "zod"
import { AuditLog } from "./types"
import { DefaultSearchParamsSchema } from "@/common/schemas"

export const AuditLogSearchParamsCache = z.object({
  sort: getSortingStateSchema<AuditLog>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema<AuditLog>().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type AuditLogSearchParams = z.infer<typeof AuditLogSearchParamsCache>
