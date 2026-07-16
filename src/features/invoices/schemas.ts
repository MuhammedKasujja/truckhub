import z from "zod"
import { Invoice } from "./types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const InvoiceSearchParams = z.object({
  sort: getSortingStateSchema<Invoice>().default([
    { id: "created_at", desc: true },
  ]),
  //  status: z.enum(ClientTypeList).optional(),
  // advanced filter
  filters: getFiltersStateSchema<Invoice>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type InvoiceListSearchParams = z.infer<typeof InvoiceSearchParams>
