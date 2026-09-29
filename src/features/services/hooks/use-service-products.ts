import { useQuery } from "@tanstack/react-query"
import { serviceQueryOptions } from "../query-options"

export function useServiceProducts() {
  return useQuery(serviceQueryOptions())
}

export function useActiveServiceProducts({ enabled }: { enabled?: boolean }) {
  return useQuery({ ...serviceQueryOptions(), enabled: enabled ?? true })
}
