import { toast } from "sonner"
import { EntityId } from "@/schemas"
import { vehicleAssignDriverFn, vehicleUnAssignDriverFn } from "../services"

export function useAssignDriver() {
  async function assignDriver(driverId: EntityId, vehicleId: EntityId) {
    const { isSuccess, error, message } = await vehicleAssignDriverFn({
      data: { driverId, vehicleId },
    })
    if (isSuccess) {
      toast.success(message)
    } else {
      toast.error(error?.message)
    }
  }
  return { assignDriver }
}

export function useUnAssignVehicleDriver() {
  async function unAssignDriver(vehicleId: EntityId) {
    const { isSuccess, error, message } = await vehicleUnAssignDriverFn({
      data: {
        id: vehicleId,
      },
    })
    if (isSuccess) {
      toast.success(message)
    } else {
      toast.error(error?.message)
    }
  }

  return { unAssignDriver }
}
