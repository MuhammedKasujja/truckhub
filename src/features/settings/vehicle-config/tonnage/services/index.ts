import {
  TonnageUpdateSchema,
  TonnageCreateSchema,
} from "@/features/settings/vehicle-config/tonnage/schemas"
import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getTonnages,
  createTonnage,
  updateTonnage,
  getTonnageById,
  deleteTonnageById,
} from "./server"

export const getTonnagesFn = createServerFn().handler(async () => {
  return getTonnages()
})

export const getTonnageFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getTonnageById(data.id)
  })

export const deleteTonnageFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return await deleteTonnageById(data.id)
  })

export const updateTonnageFn = createServerFn()
  .validator(TonnageUpdateSchema)
  .handler(async ({ data }) => {
    return updateTonnage(data)
  })

export const createTonnageFn = createServerFn()
  .validator(TonnageCreateSchema)
  .handler(async ({ data }) => {
    return createTonnage(data)
  })
