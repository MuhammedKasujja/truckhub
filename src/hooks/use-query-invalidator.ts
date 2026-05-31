import { useMemo } from "react"
import { EntityId } from "@/schemas"
import { queryKeys } from "@/lib/query-keys"
import { PaymentType } from "@/config/constants"
import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { settingsQueryKeys } from "@/features/settings/query-options"

class QueryInvalidator {
  constructor(private queryClient: QueryClient) {}

  /** Refreshes all App-wide visted queries */
  app = {
    /** Refreshes all App-wide visted queries */
    refresh: () => this.queryClient.refetchQueries(),
  }

  auth = {
    /** `Clear all app Cached data after User login` */
    invalidate: () => this.queryClient.clear(),
  }

  dashboard = {
    app: () =>
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.app(),
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
    list: () =>
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.payments.list(),
      }),
    invalidate: ({
      entityId,
      type,
    }: {
      entityId: EntityId
      type: PaymentType
    }) => {
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.payments.list(),
      })
      if (type === "booking") {
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(entityId),
        })
      }
      if (type === "ride") {
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.rides.detail(entityId),
        })
      }
    },
    invalidateBooking: (entityId: EntityId) => {
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.payments.list(),
      })
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(entityId),
      })
    },
    invalidateRide: (entityId: EntityId) => {
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.payments.list(),
      })

      this.queryClient.invalidateQueries({
        queryKey: queryKeys.rides.detail(entityId),
      })
    },
    details: (id: string) =>
      this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
  }

  settings = {
    refresh: () =>
      this.queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.list(),
      }),

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
      all: () =>
        this.queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() }),
      list: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.roles.list(),
        }),
      details: (id: string) =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.roles.detail(id),
        }),
    },
    permissions: {
      refresh: () => this.queryClient.invalidateQueries({ queryKey: [""] }),
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
            queryKey: queryKeys.carBrands.list(),
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
            queryKey: queryKeys.carModels.list(),
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
          queryKey: queryKeys.driveTrains.list(),
        }),
      details: (id: string) =>
        this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
    },
    tonnages: {
      list: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.tonnages.list(),
        }),
      details: (id: string) =>
        this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
    },
    vehiclesTypes: {
      list: () => {
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.vehiclesTypes.list(),
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
