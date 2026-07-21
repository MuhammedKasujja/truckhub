// +++++++++++++++++++++++++++
// drivers permissions
export const DriverModulePermissions = {
  "drivers:module": ["drivers:module", "drivers:read"],
  "drivers:create": ["drivers:create"],
  "drivers:view": ["drivers:view", "drivers:read"],
  "drivers:delete": ["drivers:delete"],
  "drivers:edit": ["drivers:update", "drivers:view"],
} as const;

export type DriverPermissions = keyof typeof DriverModulePermissions;

// export type DriverPermissions = `drivers@${DriverPermissionsType}`;
