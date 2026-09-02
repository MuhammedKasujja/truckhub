import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import { islandCreateSchema, islandUpdateSchema } from "../schemas"
import {
  createIsland,
  updateIsland,
  getIslandList,
  deleteIslandById,
  getIslandDetails,
} from "./server"

export const getIslandListFn = createServerFn().handler(async () => {
  return await getIslandList()
})

export const getIslandDetailsFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getIslandDetails(data.id)
  })

export const deleteIslandByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteIslandById(data.id)
  })

export const updateIslandFn = createServerFn()
  .inputValidator(islandUpdateSchema)
  .handler(async ({ data }) => {
    return updateIsland(data)
  })

export const createIslandFn = createServerFn()
  .inputValidator(islandCreateSchema)
  .handler(async ({ data }) => {
    return createIsland(data)
  })
