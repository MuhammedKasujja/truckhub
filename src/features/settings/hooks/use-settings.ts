import { useQuery } from "@tanstack/react-query"
import { settingsQueryOptions } from "../query-options"

export function useSettings() {
  const { data, isLoading } = useQuery(settingsQueryOptions())
  return { settings: data?.data, isLoading }
}
