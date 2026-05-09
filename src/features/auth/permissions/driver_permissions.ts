// +++++++++++++++++++++++++++
// drivers permissions
export const DriverModulePermissions = {
  "drivers:create": ["drivers:create"],
  "drivers:view": ["drivers:view_single", "drivers:view_list"],
  "drivers:delete": ["drivers:delete"],
  "drivers:edit": ["drivers:update", "drivers:view_single"],
} as const;

export type DriverPermissions = keyof typeof DriverModulePermissions;

// export type DriverPermissions = `drivers@${DriverPermissionsType}`;
