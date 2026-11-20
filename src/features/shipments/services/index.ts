import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  endShipmentSchema,
  ShipmentSearchParams,
  dispatchShipmentSchema,
  assignShipmentDriverSchema,
  recordShipmentDetailsSchema,
  assignShipmentVehicleSchema,
  changeShipmentVehicleSchema,
  reportShipmentDelaySchema,
} from "../schemas"
import {
  endShipment,
  getShipments,
  getShipmentById,
  dispatchShipment,
  shipmentAssignDriver,
  recordShipmentDetails,
  shipmentAssignVehicle,
  changeShipmentVehicle,
  reportShipmentDelay,
} from "./server"
import { ApiError } from "@/types"
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const getShipmentsFn = createServerFn()
  .validator(ShipmentSearchParams)
  .handler(async ({ data }) => {
    const response = await getShipments(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const getShipmentByIdFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    const result = await apiResponseTransform(getShipmentById(data.id))
    return result.data!
  })

export const endShipmentFn = createServerFn()
  .validator(endShipmentSchema)
  .handler(async ({ data }) => {
    return await apiResponseTransform(endShipment(data))
  })

export const dispatchShipmentFn = createServerFn()
  .validator(dispatchShipmentSchema)
  .handler(({ data }) => {
    return apiResponseTransform(dispatchShipment(data))
  })

export const recordShipmentDetailsFn = createServerFn()
  .validator(recordShipmentDetailsSchema)
  .handler(({ data }) => {
    return apiResponseTransform(recordShipmentDetails(data))
  })

export const shipmentAssignVehicleFn = createServerFn()
  .validator(assignShipmentVehicleSchema)
  .handler(({ data }) => {
    return apiResponseTransform(shipmentAssignVehicle(data))
  })

export const shipmentAssignDriverFn = createServerFn()
  .validator(assignShipmentDriverSchema)
  .handler(({ data }) => {
    return apiResponseTransform(shipmentAssignDriver(data))
  })

export const changeShipmentVehicleFn = createServerFn()
  .validator(changeShipmentVehicleSchema)
  .handler(({ data }) => {
    return apiResponseTransform(changeShipmentVehicle(data))
  })

export const reportShipmentDelayFn = createServerFn()
  .validator(reportShipmentDelaySchema)
  .handler(({ data }) => {
    return apiResponseTransform(reportShipmentDelay(data))
  })
