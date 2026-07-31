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
  getShipments,
  finishShipment,
  completShipment,
  getShipmentById,
  dispatchShipment,
  shipmentAssignDriver,
  shipmentAssignVehicle,
} from "./server"

export const getShipmentsFn = createServerFn()
  .inputValidator(ShipmentSearchParams)
  .handler(async ({ data }) => {
    return getShipments(data)
  })

export const getShipmentByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getShipmentById(data.id)
  })

export const completShipmentFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return completShipment(data.id)
  })

export const dispatchShipmentFn = createServerFn()
  .inputValidator(dispatchShipmentSchema)
  .handler(async ({ data }) => {
    return dispatchShipment(data)
  })

export const finishShipmentFn = createServerFn()
  .inputValidator(finishShipmentSchema)
  .handler(async ({ data }) => {
    return finishShipment(data)
  })

export const shipmentAssignVehicleFn = createServerFn()
  .inputValidator(assignShipmentVehicleSchema)
  .handler(async ({ data }) => {
    return shipmentAssignVehicle(data)
  })

export const shipmentAssignDriverFn = createServerFn()
  .inputValidator(assignShipmentDriverSchema)
  .handler(async ({ data }) => {
    return shipmentAssignDriver(data)
  })
