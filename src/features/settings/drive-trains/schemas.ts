import z from "zod"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { DriveTrain } from "@/features/settings/drive-trains/types"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const DriveTrainCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tonnage_id: z.number().optional(),
  type: z.enum(["truck", "small"]).default("small").optional(),
})

export const DriveTrainUpdateSchema = z.object({
  id: z.number(),
  ...DriveTrainCreateSchema.partial().shape,
})

export type DriveTrainCreateSchemaType = z.infer<typeof DriveTrainCreateSchema>

export type DriveTrainUpdateSchemaType = z.infer<typeof DriveTrainUpdateSchema>

export const DriveTrainSearchParamsCache = z.object({
  sort: getSortingStateSchema<DriveTrain>().default([{ id: "id", desc: true }]),
  // advanced filter
  filters: getFiltersStateSchema().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type DriveTrainListSearchParams = z.infer<
  typeof DriveTrainSearchParamsCache
>
