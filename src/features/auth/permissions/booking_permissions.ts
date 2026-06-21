// +++++++++++++++++++++++++++
// bookings permissions
export const BookingModulePermissions = {
  "bookings:create": [
    "bookings:create",
    "clients:read",
    "services:read",
    "tax_rates:read",
  ],
  "bookings:view": ["bookings:view", "bookings:read"],
  "bookings:delete": ["bookings:delete"],
  "bookings:edit": [
    "bookings:update",
    "bookings:view",
    "tax_rates:read",
  ],
  "bookings:cancel": ["bookings:cancel"],
} as const

export type BookingPermissions = keyof typeof BookingModulePermissions

// export type BookingPermissions = `bookings@${BookingPermissionsType}`;
