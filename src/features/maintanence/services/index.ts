import { createServerFn } from "@tanstack/react-start"
import {
  maintenanceCreateSchema,
  maintenanceMoveSchema,
  maintenanceSearchParams,
  maintenanceUpdateSchema,
  mechanicAssignSchema,
  mechanicRefSchema,
} from "../schemas"
import {
  assignMechanic,
  cancleMaintenance,
  changeMaintenanceStatus,
  createMaintenanceRecord,
  finishMaintenanceRecord,
  getMaintenanceBoardView,
  setLeadMechanic,
  startMaintenance,
  unassignMechanic,
  updateMaintenanceRecord,
} from "./server"
import { apiResponseTransform } from "@/lib/api-response-serializer"
import { ApiError } from "@/types"
import { EntityIdSchema } from "@/schemas"

export const getMaintenanceBoardViewFn = createServerFn()
  .validator(maintenanceSearchParams)
  .handler(async ({ data }) => {
    const response = await getMaintenanceBoardView(data)
    if (response.error) {
      const { message, statusCode } = response.error
      throw new ApiError(message, statusCode)
    }
    const items = response.data?.columns ?? []

    const result = Object.fromEntries(
      items.map((item) => [item.status, item.cards])
    )
    return result
  })

export const createMaintenanceRecordFn = createServerFn()
  .validator(maintenanceCreateSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(createMaintenanceRecord(data))
  })

export const updateMaintenanceRecordFn = createServerFn()
  .validator(maintenanceUpdateSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(updateMaintenanceRecord(data))
  })

export const changeMaintenanceStatusFn = createServerFn()
  .validator(maintenanceMoveSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(changeMaintenanceStatus(data))
  })

export const finishMaintenanceRecordFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(finishMaintenanceRecord(data.id))
  })

export const startMaintenanceFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(startMaintenance(data.id))
  })

export const cancleMaintenanceRecordFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(cancleMaintenance(data.id))
  })

export const assignMechanicFn = createServerFn({ method: "POST" })
  .validator(mechanicAssignSchema)
  .handler(async ({ data }) => apiResponseTransform(assignMechanic(data)))

export const unassignMechanicFn = createServerFn({ method: "POST" })
  .validator(mechanicRefSchema)
  .handler(async ({ data }) => apiResponseTransform(unassignMechanic(data)))

export const setLeadMechanicFn = createServerFn({ method: "POST" })
  .validator(mechanicRefSchema)
  .handler(async ({ data }) => apiResponseTransform(setLeadMechanic(data)))
