// +++++++++++++++++++++++++++
// bookings permissions
export const BookingModulePermissions = {
  "bookings:module": ["bookings:module", "bookings:read"],
  "bookings:create": [
    "bookings:create",
    "clients:read",
    "services:read",
    "tax_rates:read",
    "clients:route_pricings:view",
    "bookings:trucks:create",
  ],
  "bookings:view": ["bookings:view", "bookings:read"],
  "bookings:delete": ["bookings:delete"],
  "bookings:edit": [
    "bookings:update",
    "bookings:view",
    "clients:read",
    "services:read",
    "tax_rates:read",
    "clients:route_pricings:view",
  ],
  "bookings:cancel": ["bookings:cancel"],
} as const

export type BookingPermissions = keyof typeof BookingModulePermissions

// export type BookingPermissions = `bookings@${BookingPermissionsType}`;
