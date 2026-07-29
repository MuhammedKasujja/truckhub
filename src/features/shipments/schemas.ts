import z from "zod"
import { Shipment } from "./types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const ShipmentSearchParams = z.object({
  sort: getSortingStateSchema<Shipment>().default([{ id: "id", desc: true }]),
  // advanced filter
  filters: getFiltersStateSchema<Shipment>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type ShipmentSearchParamsInput = z.infer<typeof ShipmentSearchParams>
