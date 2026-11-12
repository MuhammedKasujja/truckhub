import z from "zod"
import { maintanenceStatuses, maintanenceTypes } from "./enums"
import { IDSchema } from "@/schemas"

export const maintenanceCreateSchema = z
  .object({
    vehicle_id: IDSchema,
    type: z.enum(maintanenceTypes),
    reason: z.string("Required").trim().min(3, "Too short"),
    start: z.date("Required"),
    end: z.date().nullable().optional(),
    expected_end: z.date().nullable().optional(),
  })
  .refine((data) => !data.end || data.end >= data.start, {
    path: ["end"],
    message: "Must be after the start",
  })
  .refine((data) => !data.expected_end || data.expected_end >= data.start, {
    path: ["expected_end"],
    message: "Must be after the start",
  })

export const maintenanceUpdateSchema = z.object({
  maintanence_id: IDSchema,
  type: z.enum(maintanenceTypes).nullable().optional(),
  reason: z.string("Required").trim().min(3, "Too short").nullable().optional(),
  expected_end: z.date().nullable().optional(),
})

export const recordBreakdownSchema = z.object({
  vehicle_id: IDSchema,
  reason: z.string("Required").trim().min(3, "Too short"),
  expected_end: z.date().nullable().optional(),
})

export const maintenanceMoveSchema = z.object({
  maintanenceId: IDSchema,
  newStatus: z.enum(maintanenceStatuses),
})

export const maintenanceSearchParams = z.object({
  per_column: z.number().max(100).optional().default(50),
  include_cancelled: z.boolean().default(false),
  vehicle_id: IDSchema.nullable().optional(),
  type: z.enum(maintanenceTypes).nullable().optional(),
})

export type MaintenanceSearchParamsInput = z.infer<
  typeof maintenanceSearchParams
>

export type MaintenanceCreateInput = z.infer<typeof maintenanceCreateSchema>

export type MaintenanceUpdateInput = z.infer<typeof maintenanceUpdateSchema>

export type RecordBreakdownInput = z.infer<typeof recordBreakdownSchema>

export type MoveRecordInput = z.infer<typeof maintenanceMoveSchema>
