import z from "zod"
import { IDSchema, ImageSchema } from "@/schemas"
import { Driver } from "@/features/drivers/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const DriverCreateSchema = z.object({
  first_name: z.string("Required").trim().min(3, "Too short"),
  last_name: z.string("Required").trim().min(3, "Too short"),
  user_name: z.string().optional().nullable(),
  phone: z.string("Required").trim().min(3, "Too short"),
  email: z.email().trim(),
  password: z.string("Required").trim().min(3, "Too short"),
  avatar: ImageSchema.nullable().optional(),
  photo_url: z.string().nullable().optional(),
  licence_number: z.string("Required").trim().min(3, "Too short"),
})

export const DriverUpdateSchema = z.object({
  id: IDSchema,
  ...DriverCreateSchema.partial().shape,
})

export type DriverCreateSchemaType = z.infer<typeof DriverCreateSchema>

export type DriverUpdateSchemaType = z.infer<typeof DriverUpdateSchema>

export const DriverSearchParamsCache = z.object({
  sort: getSortingStateSchema<Driver>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema<Driver>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type DriverListSearchParams = z.infer<typeof DriverSearchParamsCache>
