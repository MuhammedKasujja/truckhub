import { useMemo } from "react"
import { EntityId } from "@/schemas"
import { queryKeys } from "@/lib/query-keys"
import { PaymentType } from "@/config/constants"
import { QueryClient, useQueryClient } from "@tanstack/react-query"

export class QueryInvalidator {
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

  session = {
    /** `Clear all app Cached data after User login` */
    refresh: () => this.queryClient.clear(),
  }

  dashboard = {
    app: () =>
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.app(),
      }),
  }

  rides = {
    list: {
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.rides.list(),
        }),
    },
    details: (id: string) =>
      this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
  }

  quotations = {
    list: {
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.quotations.list(),
        }),
    },
    details: (id: EntityId) =>
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.quotations.detail(id),
      }),
  }

  bookings = {
    list: {
      invalidate: () => {
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.list(),
        })
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.statistics(),
        })
      },
    },
    details: (id: string) =>
      this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
  }

  invoices = {
    list: {
      invalidate: () => {
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.list(),
        })
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.statistics(),
        })
      },
    },
    details: (id: string) =>
      this.queryClient.invalidateQueries({ queryKey: ["", "detail", id] }),
  }

  services = {
    list: {
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: [
            ...queryKeys.services.list(),
            ...queryKeys.services.search(),
          ],
        }),
    },
    details: (id: string) =>
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.services.detail(id),
      }),
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
        queryKey: [
          ...queryKeys.payments.list(),
          ...queryKeys.payments.statistics(),
        ],
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
      if (type === "invoice") {
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.invoices.detail(entityId),
        })
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.invoices.list(),
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
    refresh: () => {
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.settings.app(),
      })
    },

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
            queryKey: queryKeys.settings.vehicles(),
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
            queryKey: queryKeys.settings.vehicles(),
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
          queryKey: queryKeys.settings.vehicles(),
        })
      },
      details: (id: string) => ({
        invalidate: () =>
          this.queryClient.invalidateQueries({
            queryKey: queryKeys.vehiclesTypes.detail(id),
          }),
      }),
    },
    numberPatterns: {
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.numberPatterns.list(),
        }),
    },
  }

  drivers = {
    list: {
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.drivers.list(),
        }),
    },
    details: (id: string) => ({
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.drivers.profile(id),
        }),
    }),
  }

  clients = {
    list: {
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.clients.list(),
        }),
    },
    profile: (id: string) => ({
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.clients.detail(id),
        }),
      routePricing: {
        invalidate: () =>
          this.queryClient.invalidateQueries({
            queryKey: queryKeys.clients.routePricing(id),
          }),
      },
    }),
  }

  shipments = {
    list: {
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.shipments.list(),
        }),
    },
    details: (id: string) => ({
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.shipments.detail(id),
        }),
    }),
  }

  users = {
    list: {
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.users.list(),
        }),
    },
    details: (id: string) => ({
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.drivers.profile(id),
        }),
    }),
  }

  vehicles = {
    list: {
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.vehicles.list(),
        }),
    },
    details: (id: string) => ({
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.vehicles.detail(id),
        }),
    }),
  }

  auditLogs = {
    list: {
      invalidate: () =>
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.auditLogs.list(),
        }),
    },
    details: (id: string) =>
      this.queryClient.invalidateQueries({
        queryKey: queryKeys.auditLogs.details(id),
      }),
  }
}

export function useQueryInvalidator() {
  const queryClient = useQueryClient()
  return useMemo(() => new QueryInvalidator(queryClient), [queryClient])
}
