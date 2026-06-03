export const RideModulePermissions = {
  "rides:create": ["rides:create", "tax_rates:read"],
  "rides:view": ["rides:read", "rides:view"],
  "rides:delete": ["rides:delete"],
  "rides:edit": ["rides:update", "tax_rates:read"],
} as const

export type RidePermissions = keyof typeof RideModulePermissions

// export type RidePermissions = `rides@${RidePermissionsType}`;
