import z from "zod"
import { IDSchema, MoneySchema } from "@/schemas"
import { Service } from "@/features/services/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

const ServiceBaseSchema = z.object({
  name: z.string("Required").trim().min(1, "Required"),
  seats: z.number().optional(),
  base_fare: MoneySchema,
  min_fare: MoneySchema,
  // price_per_min: MoneySchema,
  // price_per_unit_distance: MoneySchema,
  // This lives only on the frontend — it isn't sent to the API.
  target: z.enum(["model", "category"], {
    message: "Choose whether this rule targets a model or a category",
  }),
  vehicle_category_id: IDSchema.optional(),
  car_brand_id: IDSchema.optional().nullable(),
  car_model_id: IDSchema.optional().nullable(),
  start_year: z.string().optional().nullable(),
})

export const ServiceCreateSchema = z
  .object({
    ...ServiceBaseSchema.shape,
  })
  .superRefine((data, ctx) => {
    if (data.target === "model" && !data.car_model_id) {
      ctx.addIssue({
        code: "custom",
        path: ["car_model_id"],
        message: "Select a car model",
      })
    }
    if (data.target === "category" && !data.vehicle_category_id) {
      ctx.addIssue({
        code: "custom",
        path: ["vehicle_category_id"],
        message: "Select a vehicle category",
      })
    }
  })

export const ServiceUpdateSchema = z.object({
  id: IDSchema,
  ...ServiceBaseSchema.partial().shape,
})

export type ServiceCreateSchemaInput = z.infer<typeof ServiceCreateSchema>

export type ServiceUpdateSchemaInput = z.infer<typeof ServiceUpdateSchema>

export const ServiceSearchParamsCache = z.object({
  sort: getSortingStateSchema<Service>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema<Service>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type ServiceListSearchParams = z.infer<typeof ServiceSearchParamsCache>
