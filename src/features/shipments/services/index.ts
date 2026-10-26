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
} from "./server"
import { ApiError } from "@/types"
import { apiResponseTransform } from "@/lib/api-response-serializer"

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
    const result = await apiResponseTransform(getShipmentById(data.id))
    return result.data!
  })

export const endShipmentFn = createServerFn()
  .inputValidator(endShipmentSchema)
  .handler(async ({ data }) => {
    return await apiResponseTransform(endShipment(data))
  })

export const dispatchShipmentFn = createServerFn()
  .inputValidator(dispatchShipmentSchema)
  .handler(({ data }) => {
    return apiResponseTransform(dispatchShipment(data))
  })

export const recordShipmentDetailsFn = createServerFn()
  .inputValidator(recordShipmentDetailsSchema)
  .handler(({ data }) => {
    return apiResponseTransform(recordShipmentDetails(data))
  })

export const shipmentAssignVehicleFn = createServerFn()
  .inputValidator(assignShipmentVehicleSchema)
  .handler(({ data }) => {
    return apiResponseTransform(shipmentAssignVehicle(data))
  })

export const shipmentAssignDriverFn = createServerFn()
  .inputValidator(assignShipmentDriverSchema)
  .handler(({ data }) => {
    return apiResponseTransform(shipmentAssignDriver(data))
  })

export const changeShipmentVehicleFn = createServerFn()
  .inputValidator(changeShipmentVehicleSchema)
  .handler(({ data }) => {
    return apiResponseTransform(changeShipmentVehicle(data))
  })
