import { toast } from "sonner"
import { updateSettingsFn } from "../service"
import { EditSettingsSchemaType } from "../schemas"
import { settingsQueryOptions } from "../query-options"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

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

export function useEditSettings() {
  const queryInvalidator = useQueryInvalidator()

  const mutation = useMutation({
    mutationFn: (input: EditSettingsSchemaType) =>
      updateSettingsFn({ data: input }),
    onSuccess: (data) => {
      toast.success(data.message)
      queryInvalidator.settings.refresh()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  return { ...mutation }
}
