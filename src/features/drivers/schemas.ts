import z from "zod"
import { Driver } from "@/features/drivers/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const DriverCreateSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  user_name: z.string().optional().nullable(),
  phone: z.string(),
  email: z.string(),
  password: z.string(),
})

export const DriverUpdateSchema = z.object({
  id: z.number(),
  ...DriverCreateSchema.partial().shape,
})

export type DriverCreateSchemaType = z.infer<typeof DriverCreateSchema>

export type DriverUpdateSchemaType = z.infer<typeof DriverUpdateSchema>

export const DriverSearchParamsCache = z.object({
  sort: getSortingStateSchema<Driver>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema<Driver>().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type DriverListSearchParams = z.infer<typeof DriverSearchParamsCache>
