import { useMemo } from "react"
import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { settingsQueryKeys } from "@/features/settings/query-options"
import { dashboardQueryKeys } from "@/features/dashboard/query-options"
import { tonnageQueryKeys } from "@/features/settings/tonnage/query-options"
import { carBrandQueryKeys } from "@/features/settings/car-brand/query-options"
import { carModelsQueryKeys } from "@/features/settings/car-model/query-options"
import { driveTrainsQueryKeys } from "@/features/settings/drive-trains/query-options"
import { vehicleTypesQueryKeys } from "@/features/settings/vehicle-types/query-options"

class QueryInvalidator {
  constructor(private queryClient: QueryClient) {}

  dashboard = {
    app: () =>
      this.queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.app(),
      }),
  }

  rides = {
    all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
    list: () => this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
    details: (id: string) =>
      this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
  }

  bookings = {
    all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
    list: () => this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
    details: (id: string) =>
      this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
  }

  payments = {
    all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
    list: () => this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
    details: (id: string) =>
      this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
  }

  settings = {
    app: () => this.queryClient.invalidateQueries({ queryKey: [""] }),

    routes: {
      all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
      list: () =>
        this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
      details: (id: string) =>
        this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
    },
    taxRates: {
      all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
      list: () =>
        this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
      details: (id: string) =>
        this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
    },
    roles: {
      all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
      list: () =>
        this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
      details: (id: string) =>
        this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
    },
    permissions: {
      all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
      list: () =>
        this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
      details: (id: string) =>
        this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
    },
    pricingPlans: {
      all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
      list: () =>
        this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
      details: (id: string) =>
        this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
    },
    carBrands: {
      list: () =>
        Promise.all([
          this.queryClient.invalidateQueries({
            queryKey: carBrandQueryKeys.list(),
          }),
          this.queryClient.invalidateQueries({
            queryKey: settingsQueryKeys.vehicles(),
          }),
        ]),
      details: (id: string) =>
        this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
    },
    carModels: {
      list: () =>
        Promise.all([
          this.queryClient.invalidateQueries({
            queryKey: carModelsQueryKeys.list(),
          }),
          this.queryClient.invalidateQueries({
            queryKey: settingsQueryKeys.vehicles(),
          }),
        ]),
      details: (id: string) =>
        this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
    },
    driveTrains: {
      list: () =>
        this.queryClient.invalidateQueries({
          queryKey: driveTrainsQueryKeys.list(),
        }),
      details: (id: string) =>
        this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
    },
    tonnages: {
      list: () =>
        this.queryClient.invalidateQueries({
          queryKey: tonnageQueryKeys.list(),
        }),
      details: (id: string) =>
        this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
    },
    vehiclesTypes: {
      list: () => {
        this.queryClient.invalidateQueries({
          queryKey: vehicleTypesQueryKeys.list(),
        })
        this.queryClient.invalidateQueries({
          queryKey: settingsQueryKeys.vehicles(),
        })
      },
      details: (id: string) =>
        this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
    },
  }

  drivers = {
    all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
    list: () => this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
    details: (id: string) =>
      this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
  }

  clients = {
    all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
    list: () => this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
    refresh: () =>
      this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
    details: (id: string) =>
      this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
  }

  users = {
    all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
    list: () => this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
    details: (id: string) =>
      this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
  }

  vehicles = {
    all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
    list: () => this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
    details: (id: string) =>
      this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
  }

  auditLogs = {
    all: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
    list: () => this.queryClient.invalidateQueries({ queryKey: ["", "list"] }),
    details: (id: string) =>
      this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
  }
}

export function useQueryInvalidator() {
  const queryClient = useQueryClient()
  return useMemo(() => new QueryInvalidator(queryClient), [queryClient])
}
