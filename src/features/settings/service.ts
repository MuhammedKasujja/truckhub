"use server"

import * as apiClient from "@/lib/api-client";
import { EditSettingsSchemaType, Settings } from "@/features/settings/schemas";

const endpoint = "/v1/settings";

export async function getSettings() {
  return await apiClient.getFn<Settings>(`${endpoint}`);
}

export async function updateSettings(data: EditSettingsSchemaType) {
  return await apiClient.patchFn(endpoint, data);
}
