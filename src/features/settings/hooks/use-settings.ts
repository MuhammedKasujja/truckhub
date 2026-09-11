import { updateSettingsFn } from "../service"
import { useQuery } from "@tanstack/react-query"
import { EditSettingsSchemaType } from "../schemas"
import { settingsQueryOptions } from "../query-options"

export function useSettings() {
  const { data, isLoading } = useQuery(settingsQueryOptions())
  const settings = data?.data
    ? {
        ...data.data,
        fiscal_year_start_month: data.data?.fiscal_year_start_month?.toString(),
      }
    : undefined
  return { settings: settings, isLoading, error: data?.error }
}

export async function useUpdateSettings(data: Partial<EditSettingsSchemaType>) {
  const { isSuccess, error, message } = await updateSettingsFn({
    data,
  })
  return { error, message, isSuccess }
}
