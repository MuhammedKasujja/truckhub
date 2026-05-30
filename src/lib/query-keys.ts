import { driverQueryKeys } from "@/features/drivers/queries"
import { usersQueryKeys } from "@/features/users/query-options"
import { clientQueryKeys } from "@/features/clients/query-options"
import { vehicleQueryKeys } from "@/features/vehicles/query-options"
import { paymentsQueryKeys } from "@/features/payments/query-options"
import { rideQueryKeys } from "@/features/ride-requests/query-options"
import { dashboardQueryKeys } from "@/features/dashboard/query-options"
import { auditLogsQueryKeys } from "@/features/audit_logs/query-options"
import { rolesQueryKeys } from "@/features/settings/roles/query-options"
import { tonnageQueryKeys } from "@/features/settings/tonnage/query-options"
import { taxRateQueryKeys } from "@/features/settings/tax-rates/query-options"
import { carBrandQueryKeys } from "@/features/settings/car-brand/query-options"
import { carModelsQueryKeys } from "@/features/settings/car-model/query-options"
import { vehicleTypesQueryKeys } from "@/features/settings/vehicle-types/query-options"
import { bookingRoutesQueryKeys } from "@/features/settings/booking-routes/query-options"

export const queryKeys = {
  dashboard: dashboardQueryKeys,
  rides: rideQueryKeys,
  bookings: bookingRoutesQueryKeys,
  payments: paymentsQueryKeys,
  routes: bookingRoutesQueryKeys,
  taxRates: taxRateQueryKeys,
  roles: rolesQueryKeys,
  carBrands: carBrandQueryKeys,
  carModels: carModelsQueryKeys,
  driveTrains: driverQueryKeys,
  tonnages: tonnageQueryKeys,
  vehiclesTypes: vehicleTypesQueryKeys,

  setiings: {
    app: () => ({ queryKey: [""] }),
    pricingPlans: {
      all: () => ({ queryKey: [""] }),
      list: () => ({ queryKey: ["", "list"] }),
      details: (id: string) => ({ queryKey: ["", "detail", id] }),
    },
  },

  drivers: driverQueryKeys,
  clients: clientQueryKeys,
  users: usersQueryKeys,
  vehicles: vehicleQueryKeys,
  auditLogs: auditLogsQueryKeys,
}
