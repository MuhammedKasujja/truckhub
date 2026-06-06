import * as apiClient from "@/lib/api-client"
import { EntityNumberPattern } from "../types"
import { EntityNumberPatternType } from "../schemas"

const endpoint = "/v1/settings/entity-numbers"

export async function getEntityNumberPatterns() {
  return apiClient.getFn<EntityNumberPattern[]>(endpoint)
}

export async function updateEntityNumberPatterns(
  data: EntityNumberPatternType
) {
  return apiClient.postFn<EntityNumberPattern[]>(endpoint, data)
}
