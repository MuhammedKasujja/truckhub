import * as apiClient from "@/lib/api-client"
import { EntityNumberPattern } from "../types"

type EntityNumberUpdateRequest = {
  entity_name: string
  pattern: string
  counter_padding: number
}

const endpoint = "/v1/settings/entity-numbers"

export async function getEntityNumberPatterns() {
  return apiClient.getFn<EntityNumberPattern[]>(endpoint)
}

export async function updateEntityNumberPatterns(
  data: EntityNumberUpdateRequest[]
) {
  return apiClient.putFn<EntityNumberPattern[]>(endpoint, data)
}
