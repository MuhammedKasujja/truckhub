import { useEffect, useState } from "react"
import { useSettings } from "../../hooks/use-settings"
import { createTaxRatesQueryOptions } from "../query-options"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"

export function useTaxRatesQuery() {
  const { data, isLoading, refetch } = useQuery(createTaxRatesQueryOptions())

  return { data: data?.data, error: data?.error, isLoading, refetch }
}

export function useTaxRatesSuspense() {
  const {
    data: { data, error },
    isLoading,
  } = useSuspenseQuery(createTaxRatesQueryOptions())

  return { data, error, isLoading }
}

export function useDefaultTaxRate() {
  const { settings } = useSettings()
  const [taxRate, setTaxRate] = useState(settings?.default_tax_rate)

  useEffect(() => {
    setTaxRate(settings?.default_tax_rate)
  }, [settings])

  return taxRate
}
