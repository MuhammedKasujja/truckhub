export const ServiceModulePermissions = {
  "services:create": ["services:create"],
  "services:view": ["services:view_list", "services:view_single"],
  "services:delete": ["services:delete"],
  "services:edit": ["services:update"],
} as const;

export type ServicePermissions = keyof typeof ServiceModulePermissions;

// export type ServicePermissions = `services@${SerivePermissionsType}`;
