import { RideModulePermissions } from "./ride_permissions";
import { UserModulePermissions } from "./users_permissions";
import { DriverModulePermissions } from "./driver_permissions";
import { ConfigModulePermissions } from "./config_permissions";
import { ClientModulePermissions } from "./client_permissions";
import { ReportsModulePermissions } from "./reports_permissions";
import { BookingModulePermissions } from "./booking_permissions";
import { VehicleModulePermissions } from "./vehicle_permissions";
import { PaymentModulePermissions } from "./payment_permissions";
import { BillingModulePermissions } from "./billing_permissions";
import { InvoiceModulePermissions } from "./invoice_permissions";
import { ServiceModulePermissions } from "./services_permissions";
import { ShipmentModulePermissions } from "./shipment_permissions";
import { QuotationModulePermissions } from "./quotation_permissions";
import { DashboardModulePermissions } from "./dashboard_permissions";
import { MaintenanceModulePermissions } from "./maintenance_permissions";
import { HrModulePermissions, SelfServicePermissions } from "./hr_permissions";

/**
 * Derived system permissions based on the `StoreDatabasePermissions`
 */
export const KeyNamedPermissions = {
  ...DashboardModulePermissions,
  ...QuotationModulePermissions,
  ...InvoiceModulePermissions,
  ...ShipmentModulePermissions,
  ...UserModulePermissions,
  // ...BookingModulePermissions,
  ...ServiceModulePermissions,
  // ...RideModulePermissions,
  ...PaymentModulePermissions,
  ...ClientModulePermissions,
  ...BillingModulePermissions,
  ...DriverModulePermissions,
  ...VehicleModulePermissions,
  ...ConfigModulePermissions,
  ...ReportsModulePermissions,
  ...MaintenanceModulePermissions,
  ...HrModulePermissions,
  ...SelfServicePermissions,
} as const;

export type UserPermission = keyof typeof KeyNamedPermissions;

/**
 * What opening a module needs: its `*:module` key (frontend-only: shows the
 * module in the menu, grants no API permission) plus the key that grants its
 * data, at "any" or "own" scope. Used by the list pages, their sidebar items
 * and the widgets that show the module's records, so they always agree.
 *
 * Detail and edit pages check only their data key, so a permitted record
 * still opens from a link elsewhere when the module is off.
 */
export const ModuleAccess = {
  quotations: ["quotations:module", "quotations:view"],
  invoices: ["invoices:module", "invoices:view"],
  payments: ["payments:module", "payments:view"],
  clients: ["clients:module", "clients:view"],
  drivers: ["drivers:module", "drivers:view"],
  vehicles: ["vehicles:module", "vehicles:view"],
  services: ["services:module", "services:view"],
  billing: ["billing:module", "billing:view"],
  shipments: ["shipments:module", "shipments:view"],
  maintenance: ["maintenance:module", "maintenance:view"],
} as const satisfies Record<string, readonly UserPermission[]>;

export const SystemPermissions = {
  dashboard: DashboardModulePermissions,
  quotations: QuotationModulePermissions,
  invoices: InvoiceModulePermissions,
  shipment: ShipmentModulePermissions,
  // bookings: BookingModulePermissions,
  services: ServiceModulePermissions,
  // rides: RideModulePermissions,
  payments: PaymentModulePermissions,
  billing: BillingModulePermissions,
  customers: ClientModulePermissions,
  drivers: DriverModulePermissions,
  vehicles: VehicleModulePermissions,
  maintenance: MaintenanceModulePermissions,
  hr: HrModulePermissions,
  users: UserModulePermissions,
  config: ConfigModulePermissions,
  reports: ReportsModulePermissions,
};

export type PermissionModule = keyof typeof SystemPermissions;

/**
 * Returns Stored database level permission names with typesafe
 */
export type StoreDatabasePermissions = {
  [K in keyof typeof SystemPermissions]: (typeof SystemPermissions)[K][keyof (typeof SystemPermissions)[K]];
}[keyof typeof SystemPermissions][number];

///

// type CanViewUsers    = Extract<UserPermissions, `${string}:view` | `${string}:details`>;
// type CanMutateUsers  = Extract<UserPermissions, `${string}:create` | `${string}:delete` | `${string}:edit`>;
