import { getShipments } from "./server"
import { ShipmentSearchParams } from "../schemas"
import { createServerFn } from "@tanstack/react-start"

export const getShipmentsFn = createServerFn()
  .inputValidator(ShipmentSearchParams)
  .handler(async ({ data }) => {
    return getShipments(data)
  })
