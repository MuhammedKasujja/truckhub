// +++++++++++++++++++++++++++
// customer permissions
export const ClientModulePermissions = {
  "clients:module": ["clients:module", "clients:read"],
  "clients:create": ["clients:create"],
  "clients:view": ["clients:view", "clients:read"],
  "clients:delete": ["clients:delete"],
  "clients:edit": ["clients:update", "clients:view"],
} as const;

export type ClientPermissions = keyof typeof ClientModulePermissions;

// export type CustomerPermissions = `customers@${CustomerPermissionsType}`;
