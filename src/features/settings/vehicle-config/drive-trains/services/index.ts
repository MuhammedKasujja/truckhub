import {
  DriveTrainUpdateSchema,
  DriveTrainCreateSchema,
  DriveTrainSearchParamsCache,
} from "@/features/settings/vehicle-config/drive-trains/schemas"
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
  .validator(DriveTrainSearchParamsCache)
  .handler(async ({ data }) => {
    return await getDriveTrains()
  })

export const getDriveTrainFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getDriveTrainById(data.id)
  })

export const deleteDriveTrainFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteDriveTrainById(data.id)
  })

export const updateDriveTrainFn = createServerFn()
  .validator(DriveTrainUpdateSchema)
  .handler(async ({ data }) => {
    return updateDriveTrain(data)
  })

export const createDriveTrainFn = createServerFn()
  .validator(DriveTrainCreateSchema)
  .handler(async ({ data }) => {
    return createDriveTrain(data)
  })
