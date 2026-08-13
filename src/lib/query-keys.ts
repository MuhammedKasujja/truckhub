import { driverQueryKeys } from "@/features/drivers/queries"
import { usersQueryKeys } from "@/features/users/query-options"
import { clientQueryKeys } from "@/features/clients/query-options"
import { vehicleQueryKeys } from "@/features/vehicles/query-options"
import { serviceQueryKeys } from "@/features/services/query-options"
import { invoiceQueryKeys } from "@/features/invoices/query-options"
import { paymentsQueryKeys } from "@/features/payments/query-options"
import { settingsQueryKeys } from "@/features/settings/query-options"
import { rideQueryKeys } from "@/features/ride-requests/query-options"
import { dashboardQueryKeys } from "@/features/dashboard/query-options"
import { bookingsQueryKeys } from "@/features/bookings/queries-options"
import { shipmentsQueryKeys } from "@/features/shipments/query-options"
import { auditLogsQueryKeys } from "@/features/audit_logs/query-options"
import { rolesQueryKeys } from "@/features/settings/roles/query-options"
import { quotationQueryKeys } from "@/features/quotations/query-options"
import { tonnageQueryKeys } from "@/features/settings/tonnage/query-options"
import { pricingQueryKeys } from "@/features/settings/pricing/query-options"
import { taxRateQueryKeys } from "@/features/settings/tax-rates/query-options"
import { carBrandQueryKeys } from "@/features/settings/car-brand/query-options"
import { carModelsQueryKeys } from "@/features/settings/car-model/query-options"
import { vehicleTypesQueryKeys } from "@/features/settings/vehicle-types/query-options"
import { bookingRoutesQueryKeys } from "@/features/settings/booking-routes/query-options"
import { entityNumberPattensQueryKeys } from "@/features/settings/entity-numbers/query-options"

export const queryKeys = {
  dashboard: dashboardQueryKeys,
  rides: rideQueryKeys,
  bookings: bookingsQueryKeys,
  invoices: invoiceQueryKeys,
  payments: paymentsQueryKeys,
  routes: bookingRoutesQueryKeys,
  taxRates: taxRateQueryKeys,
  roles: rolesQueryKeys,
  carBrands: carBrandQueryKeys,
  carModels: carModelsQueryKeys,
  driveTrains: driverQueryKeys,
  tonnages: tonnageQueryKeys,
  vehiclesTypes: vehicleTypesQueryKeys,
  services: serviceQueryKeys,
  numberPatterns: entityNumberPattensQueryKeys,

  settings: {
    app: () => settingsQueryKeys.list(),
    vehiclesConfig: () => settingsQueryKeys.vehiclesConfig(),
    pricingPlans: pricingQueryKeys,
  },

  drivers: driverQueryKeys,
  clients: clientQueryKeys,
  users: usersQueryKeys,
  vehicles: vehicleQueryKeys,
  auditLogs: auditLogsQueryKeys,
  quotations: quotationQueryKeys,
  shipments: shipmentsQueryKeys,
}
