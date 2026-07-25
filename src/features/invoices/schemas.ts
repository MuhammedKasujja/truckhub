import z from "zod"
import { Invoice } from "./types"
import { IDSchema } from "@/schemas"
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

export const createInvoiceSchema = z.object({
  booking_id: IDSchema,
  due_date: z.string(),
})

export type InvoiceCreateInput = z.infer<typeof createInvoiceSchema>