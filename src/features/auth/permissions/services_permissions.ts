export const ServiceModulePermissions = {
  "services:create": ["services:create", "tax_rates:read"],
  "services:view": ["services:read", "services:view"],
  "services:delete": ["services:delete"],
  "services:edit": ["services:update", "tax_rates:read"],
} as const

export type ServicePermissions = keyof typeof ServiceModulePermissions

// export type ServicePermissions = `services@${SerivePermissionsType}`;
