"use server"

import * as apiClient from "@/lib/api-client"
import { createServerFn } from "@tanstack/react-start"
import { EditSettingsSchemaType, Settings } from "@/features/settings/schemas"

const endpoint = "/v1/settings"

export const getSettingsFn = createServerFn().handler(async () => {
  return await apiClient.getFn<Settings>(`${endpoint}`)
})

export async function updateSettings(data: EditSettingsSchemaType) {
  return await apiClient.patchFn(endpoint, data)
}
