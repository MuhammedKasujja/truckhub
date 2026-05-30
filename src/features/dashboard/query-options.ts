import { queryOptions } from "@tanstack/react-query"
import { getDashboardStatisticsFn } from "./services"

export const dashboardQueryKeys ={
  app: ()=>['main-dashboard']
}

export const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: ["main-dashboard"],
    queryFn: () => getDashboardStatisticsFn(),
  })
