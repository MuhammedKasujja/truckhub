export const ServiceModulePermissions = {
  "services:create": ["services:create", "tax_rates:view_list"],
  "services:view": ["services:view_list", "services:view_single"],
  "services:delete": ["services:delete"],
  "services:edit": ["services:update", "tax_rates:view_list"],
} as const

export type ServicePermissions = keyof typeof ServiceModulePermissions

// export type ServicePermissions = `services@${SerivePermissionsType}`;
