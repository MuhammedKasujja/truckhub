import * as apiClient from "@/lib/api-client"
import { EntityNumberPattern } from "../types"
import { NumberingPatternType } from "../schemas"

const endpoint = "/v1/settings/entity-numbers"

export async function getEntityNumberPatterns() {
  return apiClient.getFn<EntityNumberPattern[]>(endpoint)
}

export async function updateEntityNumberPatterns(data: NumberingPatternType) {
  return apiClient.postFn<EntityNumberPattern[]>(endpoint, data)
}
