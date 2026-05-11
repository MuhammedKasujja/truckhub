import {
  DriveTrainUpdateSchema,
  DriveTrainCreateSchema,
  DriveTrainSearchParamsCache,
} from "@/features/settings/drive-trains/schemas"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getDriveTrains,
  createDriveTrain,
  updateDriveTrain,
  getDriveTrainById,
  deleteDriveTrainById,
} from "./server"

export const getDriveTrainsFn = createServerFn()
  .inputValidator((data) => DriveTrainSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return await getDriveTrains(data)
  })

export const getDriveTrainFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getDriveTrainById(data.id)
  })

export const deleteDriveTrainFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteDriveTrainById(data.id)
  })

export const updateDriveTrainFn = createServerFn()
  .inputValidator(DriveTrainUpdateSchema)
  .handler(async ({ data }) => {
    return updateDriveTrain(data)
  })

export const createDriveTrainFn = createServerFn()
  .inputValidator(DriveTrainCreateSchema)
  .handler(async ({ data }) => {
    return createDriveTrain(data)
  })
