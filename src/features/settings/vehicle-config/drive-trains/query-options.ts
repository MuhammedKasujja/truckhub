import { getDriveTrainsFn } from "./services"
import { queryOptions } from "@tanstack/react-query"
import { DriveTrainListSearchParams } from "./schemas"

export const driveTrainsQueryKeys = {
  all: () => ["drive-trains"] as const,
  list: () => [...driveTrainsQueryKeys.all(), "list"] as const,
} as const

export const createDriveTrainsListQueryOptions = (
  search: DriveTrainListSearchParams
) =>
  queryOptions({
    queryKey: [...driveTrainsQueryKeys.list(), search],
    queryFn: () => getDriveTrainsFn({ data: search }),
  })
