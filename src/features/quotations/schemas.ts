import z from "zod"
import { Quotation } from "./types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const QuotationSearchParams = z.object({
  sort: getSortingStateSchema<Quotation>().default([
    { id: "created_at", desc: true },
  ]),
  filters: getFiltersStateSchema<Quotation>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type QuotationListSearchParams = z.infer<typeof QuotationSearchParams>