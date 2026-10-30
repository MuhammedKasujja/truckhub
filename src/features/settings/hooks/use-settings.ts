import { toast } from "sonner"
import { updateSettingsFn } from "../service"
import { settingsQueryOptions } from "../query-options"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CompanyInput, EditSettingsSchemaType } from "../schemas"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { updateCompanyDetailsFn } from "../company-details/services"

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

export function useEditCompanyDetails() {
  const queryInvalidator = useQueryInvalidator()

  const mutation = useMutation({
    mutationFn: (input: CompanyInput) => updateCompanyDetailsFn({ data: input }),
    onSuccess: (data) => {
      toast.success(data.message)
      queryInvalidator.settings.refresh()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const editCompany = (
      input: CompanyInput,
      opts?: Parameters<typeof mutation.mutate>[1]
    ) => {
      if (mutation.isPending) return
      return mutation.mutate(input, opts)
    }
  return { ...mutation, editCompany }
}
