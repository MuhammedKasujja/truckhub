import { Island } from "../types"
import { EntityId } from "@/schemas"
import * as apiClient from "@/lib/api-client"
import { IslandCreateSchemaType, IslandUpdateSchemaType } from "../schemas"

const endpoint = "/v1/islands"

export async function getIslandList() {
  const { data, isSuccess, error } = await apiClient.getFn<Island[]>(endpoint)
  return { data: isSuccess ? data! : [], error }
}

export async function getIslandDetails(islandId: EntityId) {
  return await apiClient.getFn<Island>(`${endpoint}/${islandId}`)
}

export async function deleteIslandById(islandId: EntityId) {
  return await apiClient.deleteFn(`${endpoint}/${islandId}`)
}

export async function updateIsland(data: IslandUpdateSchemaType) {
  const { id: carBrandId, ...rest } = data
  return await apiClient.putFn<Island>(`${endpoint}/${carBrandId}`, rest)
}

export async function createIsland(data: IslandCreateSchemaType) {
  return await apiClient.postFn<Island>(endpoint, data)
}
