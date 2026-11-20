import { bulkUpertVehicleFeatures } from "./server"
import { vehicleFeatureFormSchema } from "../schemas"
import { createServerFn } from "@tanstack/react-start"

export const bulkUpertVehicleFeaturesFn = createServerFn({ method: "POST" })
  .validator(vehicleFeatureFormSchema)
  .handler(async ({ data }) => {
    return bulkUpertVehicleFeatures(data.features)
  })
