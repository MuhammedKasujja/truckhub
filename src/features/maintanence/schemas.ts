import z from "zod"
import { IDSchema } from "@/schemas"
import { maintanenceStatuses, maintanenceTypes } from "./enums"

export const maintenanceCreateSchema = z.object({
  vehicle_id: IDSchema,
  type: z.enum(maintanenceTypes),
  reason: z.string("Required").trim().min(3, "Too short"),
  start: z.date("Required"),
  end: z.date().nullable().optional(),
  expected_end: z.date().nullable().optional(),
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

export type MaintenanceCreateInput = z.infer<typeof maintenanceCreateSchema>

export type MaintenanceUpdateInput = z.infer<typeof maintenanceUpdateSchema>

export type RecordBreakdownInput = z.infer<typeof recordBreakdownSchema>

export type MoveRecordInput = z.infer<typeof maintenanceMoveSchema>
