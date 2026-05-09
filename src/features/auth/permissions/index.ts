import { RideModulePermissions } from "./ride_permissions";
import { UserModulePermissions } from "./users_permissions";
import { DriverModulePermissions } from "./driver_permissions";
import { ConfigModulePermissions } from "./config_permissions";
import { BookingModulePermissions } from "./booking_permissions";
import { VehicleModulePermissions } from "./vehicle_permissions";
import { PaymentModulePermissions } from "./payment_permissions";
import { ServiceModulePermissions } from "./services_permissions";
import { CustomerModulePermissions } from "./customer_permissions";

/**
 * Derived system permissions based on the `StoreDatabasePermissions`
 */
export const KeyNamedPermissions = {
  ...UserModulePermissions,
  ...BookingModulePermissions,
  ...ServiceModulePermissions,
  ...RideModulePermissions,
  ...PaymentModulePermissions,
  ...CustomerModulePermissions,
  ...DriverModulePermissions,
  ...VehicleModulePermissions,
  ...ConfigModulePermissions,
} as const;

export type UserPermission = keyof typeof KeyNamedPermissions;

export const SystemPermissions = {
  users: UserModulePermissions,
  bookings: BookingModulePermissions,
  services: ServiceModulePermissions,
  rides: RideModulePermissions,
  payments: PaymentModulePermissions,
  customers: CustomerModulePermissions,
  drivers: DriverModulePermissions,
  vehicles: VehicleModulePermissions,
  config: ConfigModulePermissions,
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
