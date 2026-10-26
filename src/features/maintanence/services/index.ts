import { ApiError } from "@/types"
import { createServerFn } from "@tanstack/react-start"
import { apiResponseTransform } from "@/lib/api-response-serializer"
import {
  maintenanceMoveSchema,
  maintenanceCreateSchema,
  maintenanceUpdateSchema,
  maintenanceSearchParams,
} from "../schemas"
import {
  startMaintenance,
  cancleMaintenance,
  createMaintenanceRecord,
  getMaintenanceBoardView,
  updateMaintenanceRecord,
  changeMaintenanceStatus,
  finishMaintenanceRecord,
} from "./server"
import { EntityIdSchema } from "@/schemas"

export const getMaintenanceBoardViewFn = createServerFn()
  .inputValidator(maintenanceSearchParams)
  .handler(async ({data}) => {
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
  .inputValidator(maintenanceCreateSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(createMaintenanceRecord(data))
  })

export const updateMaintenanceRecordFn = createServerFn()
  .inputValidator(maintenanceUpdateSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(updateMaintenanceRecord(data))
  })

export const changeMaintenanceStatusFn = createServerFn()
  .inputValidator(maintenanceMoveSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(changeMaintenanceStatus(data))
  })

export const finishMaintenanceRecordFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(finishMaintenanceRecord(data.id))
  })

export const startMaintenanceFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(startMaintenance(data.id))
  })

export const cancleMaintenanceRecordFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(cancleMaintenance(data.id))
  })
