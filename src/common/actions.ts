export type Entity =
  | "Booking"
  | "User"
  | "Payment"
  | "Service"
  | "Ride"
  | "Driver"
  | "Client"
  | "Vehicle"

export type BookingActions =
  | "create"
  | "update"
  | "archive"
  | "delete"
  | "assign_user"
  | "unarchive"
  | "make-payment"

export type RideActions =
  | "create"
  | "update"
  | "archive"
  | "delete"
  | "assign_user"
  | "unarchive"
  | "make-payment"

export type ClientActions =
  | "create"
  | "update"
  | "archive"
  | "delete"
  | "assign_user"
  | "unarchive"
  | "make-payment"

export type DriverActions =
  | "create"
  | "update"
  | "archive"
  | "delete"
  | "assign_user"
  | "unarchive"
  | "assign-vehicle"
  | "remove-vehicle"

export type VehicleActions =
  | "create"
  | "update"
  | "archive"
  | "delete"
  | "assign_user"
  | "unarchive"
  | "assign-driver"
  | "remove-driver"

export type UserActions =
  | "create"
  | "update"
  | "archive"
  | "delete"
  | "assign-roles"
