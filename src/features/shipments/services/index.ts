import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  finishShipmentSchema,
  ShipmentSearchParams,
  dispatchShipmentSchema,
  assignShipmentDriverSchema,
  assignShipmentVehicleSchema,
} from "../schemas"
import {
  endShipment,
  getShipments,
  finishShipment,
  getShipmentById,
  dispatchShipment,
  shipmentAssignDriver,
  shipmentAssignVehicle,
} from "./server"
import { ApiError } from "@/types"

export const getShipmentsFn = createServerFn()
  .inputValidator(ShipmentSearchParams)
  .handler(async ({ data }) => {
    return getShipments(data)
  })

export const getShipmentByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await getShipmentById(data.id)
    if (result.error) {
      throw new ApiError(result.error.message, 400)
    }
    return { data: result.data!, message: result.message }
  })

export const endShipmentFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await endShipment(data.id)
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

export const finishShipmentFn = createServerFn()
  .inputValidator(finishShipmentSchema)
  .handler(async ({ data }) => {
    const result = await finishShipment(data)
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
