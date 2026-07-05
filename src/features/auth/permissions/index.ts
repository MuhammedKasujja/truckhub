import { RideModulePermissions } from "./ride_permissions";
import { UserModulePermissions } from "./users_permissions";
import { DriverModulePermissions } from "./driver_permissions";
import { ConfigModulePermissions } from "./config_permissions";
import { ClientModulePermissions } from "./client_permissions";
import { ReportsModulePermissions } from "./reports_permissions";
import { BookingModulePermissions } from "./booking_permissions";
import { VehicleModulePermissions } from "./vehicle_permissions";
import { PaymentModulePermissions } from "./payment_permissions";
import { ServiceModulePermissions } from "./services_permissions";
import { DashboardModulePermissions } from "./dashboard_permissions";

/**
 * Derived system permissions based on the `StoreDatabasePermissions`
 */
export const KeyNamedPermissions = {
  ...DashboardModulePermissions,
  ...UserModulePermissions,
  ...BookingModulePermissions,
  ...ServiceModulePermissions,
  ...RideModulePermissions,
  ...PaymentModulePermissions,
  ...ClientModulePermissions,
  ...DriverModulePermissions,
  ...VehicleModulePermissions,
  ...ConfigModulePermissions,
  ...ReportsModulePermissions
} as const;

export type UserPermission = keyof typeof KeyNamedPermissions;

export const SystemPermissions = {
  dashboard: DashboardModulePermissions,
  bookings: BookingModulePermissions,
  services: ServiceModulePermissions,
  rides: RideModulePermissions,
  payments: PaymentModulePermissions,
  customers: ClientModulePermissions,
  drivers: DriverModulePermissions,
  vehicles: VehicleModulePermissions,
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
