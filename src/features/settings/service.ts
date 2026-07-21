"use server"

import { Prettify } from "@/types"
import * as apiClient from "@/lib/api-client"
import { createServerFn } from "@tanstack/react-start"
import { VehicleConfigurations } from "@/types/setting"
import {
  Settings,
  CompanySettings,
  EditSettingsSchema,
  EditInvoiceTermsSchema,
} from "@/features/settings/schemas"

const endpoint = "/v1/settings"

export const getSettingsFn = createServerFn().handler(async () => {
  return await apiClient.getFn<Prettify<CompanySettings>>(endpoint)
})

export const updateSettingsFn = createServerFn()
  .inputValidator(EditSettingsSchema)
  .handler(async ({ data }) => {
    return await apiClient.patchFn<Settings>(endpoint, data)
  })

export const updateInvoiceTermsFn = createServerFn()
  .inputValidator(EditInvoiceTermsSchema)
  .handler(async ({ data }) => {
    return await apiClient.patchFn<Settings>(endpoint, {
      invoice_terms: data.invoiceTerms?.map((term) => term.value),
    })
  })

export const updateQoutationTermsFn = createServerFn()
  .inputValidator(EditInvoiceTermsSchema)
  .handler(async ({ data }) => {
    return await apiClient.patchFn<Settings>(endpoint, {
      quotation_terms: data.quotationTerms?.map((term) => term.value),
    })
  })

export const getVehicleSettingsFn = createServerFn().handler(async () => {
  return await apiClient.getFn<VehicleConfigurations>(
    "/v1/settings/vehicle-config"
  )
})
