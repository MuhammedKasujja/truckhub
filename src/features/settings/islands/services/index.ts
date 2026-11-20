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
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const getIslandListFn = createServerFn().handler(async () => {
  return await getIslandList()
})

export const getIslandDetailsFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return apiResponseTransform(getIslandDetails(data.id))
  })

export const deleteIslandByIdFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteIslandById(data.id)
  })

export const updateIslandFn = createServerFn()
  .validator(islandUpdateSchema)
  .handler(async ({ data }) => {
    return updateIsland(data)
  })

export const createIslandFn = createServerFn()
  .validator(islandCreateSchema)
  .handler(async ({ data }) => {
    return createIsland(data)
  })
