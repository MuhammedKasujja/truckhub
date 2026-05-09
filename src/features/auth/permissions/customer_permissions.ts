// +++++++++++++++++++++++++++
// customer permissions
export const CustomerModulePermissions = {
  "clients:create": ["clients:create"],
  "clients:view": ["clients:view_single", "clients:view_list"],
  "clients:delete": ["clients:delete"],
  "clients:edit": ["clients:update", "clients:view_single"],
} as const;

export type BookingPermissions = keyof typeof CustomerModulePermissions;

// export type CustomerPermissions = `customers@${CustomerPermissionsType}`;
