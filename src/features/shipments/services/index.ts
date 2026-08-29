import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  endShipmentSchema,
  ShipmentSearchParams,
  dispatchShipmentSchema,
  assignShipmentDriverSchema,
  recordShipmentDetailsSchema,
  assignShipmentVehicleSchema,
} from "../schemas"
import {
  endShipment,
  getShipments,
  getShipmentById,
  dispatchShipment,
  shipmentAssignDriver,
  recordShipmentDetails,
  shipmentAssignVehicle,
} from "./server"
import { ApiError } from "@/types"

export const getShipmentsFn = createServerFn()
  .inputValidator(ShipmentSearchParams)
  .handler(async ({ data }) => {
    const response = await getShipments(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const getShipmentByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await getShipmentById(data.id)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return result.data!
  })

export const endShipmentFn = createServerFn()
  .inputValidator(endShipmentSchema)
  .handler(async ({ data }) => {
    const result = await endShipment(data)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data, message: result.message }
  })

export const dispatchShipmentFn = createServerFn()
  .inputValidator(dispatchShipmentSchema)
  .handler(async ({ data }) => {
    const result = await dispatchShipment(data)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data, message: result.message }
  })

export const recordShipmentDetailsFn = createServerFn()
  .inputValidator(recordShipmentDetailsSchema)
  .handler(async ({ data }) => {
    const result = await recordShipmentDetails(data)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data, message: result.message }
  })

export const shipmentAssignVehicleFn = createServerFn()
  .inputValidator(assignShipmentVehicleSchema)
  .handler(async ({ data }) => {
    const result = await shipmentAssignVehicle(data)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data, message: result.message }
  })

export const shipmentAssignDriverFn = createServerFn()
  .inputValidator(assignShipmentDriverSchema)
  .handler(async ({ data }) => {
    const result = await shipmentAssignDriver(data)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data, message: result.message }
  })
