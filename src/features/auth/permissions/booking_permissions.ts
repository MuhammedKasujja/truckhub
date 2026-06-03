// +++++++++++++++++++++++++++
// bookings permissions
export const BookingModulePermissions = {
  "bookings:create": [
    "bookings:create",
    "passengers:read",
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
  // TODO: separate this into its own module permissions
  "rides:create": [
    "bookings:create",
    "passengers:read",
    "services:read",
  ],
  "rides:view": ["bookings:view", "bookings:read"],
  "rides:delete": ["bookings:delete"],
  "rides:edit": ["bookings:update", "bookings:view"],
} as const

export type BookingPermissions = keyof typeof BookingModulePermissions

// export type BookingPermissions = `bookings@${BookingPermissionsType}`;
