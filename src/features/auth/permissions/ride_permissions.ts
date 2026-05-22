export const RideModulePermissions = {
  "rides:create": ["rides:create", "tax_rates:view_list"],
  "rides:view": ["rides:list", "rides:single"],
  "rides:delete": ["rides:delete"],
  "rides:edit": ["rides:update", "tax_rates:view_list"],
} as const

export type RidePermissions = keyof typeof RideModulePermissions

// export type RidePermissions = `rides@${RidePermissionsType}`;
