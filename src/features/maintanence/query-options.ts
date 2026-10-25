import { queryOptions } from "@tanstack/react-query"
import { getMaintenanceBoardViewFn } from "./services"

export const maintenanceQueryKeys = {
  all: () => ["maintenance"],
  board: () => [...maintenanceQueryKeys.all(), "board"],
} as const

export const maintenanceBoardQueryOptions = () =>
  queryOptions({
    queryKey: maintenanceQueryKeys.board(),
    queryFn: () => getMaintenanceBoardViewFn(),
  })
