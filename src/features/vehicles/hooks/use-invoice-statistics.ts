import { useQuery } from "@tanstack/react-query"
import { vehicleStatisticsQueryOptions } from "../query-options"

export function useVehicleStatistics() {
  const { isLoading, data, error, isFetching } = useQuery({
    ...vehicleStatisticsQueryOptions(),
  })

  return { isLoading, data: data?.data, error, isFetching }
}
