import { updateSettingsFn } from "../service"
import { useQuery } from "@tanstack/react-query"
import { EditSettingsSchemaType } from "../schemas"
import { settingsQueryOptions } from "../query-options"

export function useSettings() {
  const { data, isLoading } = useQuery(settingsQueryOptions())
  return { settings: data?.data, isLoading }
}

export async function useUpdateSettings(data: Partial<EditSettingsSchemaType>) {

  const { isSuccess, error, message } = await updateSettingsFn({
    data,
  })
  return { error, message, isSuccess }
}
