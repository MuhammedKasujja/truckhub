"use server"

import * as apiClient from "@/lib/api-client"
import { createServerFn } from "@tanstack/react-start"
import { EditSettingsSchema, Settings } from "@/features/settings/schemas"

const endpoint = "/v1/settings"

export const getSettingsFn = createServerFn().handler(async () => {
  return await apiClient.getFn<Settings>(endpoint)
})

export const updateSettingsFn = createServerFn()
  .inputValidator(EditSettingsSchema)
  .handler(async ({ data }) => {
    return await apiClient.patchFn<Settings>(endpoint, data)
  })
