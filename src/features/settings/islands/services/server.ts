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
  const { id: islandId, name, ...rest } = data
  const locations = rest.locations?.map((loc) => loc.value)
  return await apiClient.putFn<Island>(`${endpoint}/${islandId}`, {
    name,
    locations,
  })
}

export async function createIsland(data: IslandCreateSchemaType) {
  const locations = data.locations.map((loc) => loc.value)
  return await apiClient.postFn<Island>(endpoint, {
    name: data.name,
    locations,
  })
}
