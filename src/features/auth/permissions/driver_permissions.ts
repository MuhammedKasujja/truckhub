// +++++++++++++++++++++++++++
// drivers permissions
export const DriverModulePermissions = {
  "drivers:module": ["drivers:module", "drivers:read"],
  "drivers:create": ["drivers:create"],
  "drivers:view": ["drivers:view", "drivers:read"],
  "drivers:delete": ["drivers:delete"],
  "drivers:edit": ["drivers:update", "drivers:view"],
  // A driver's documents
  "drivers:documents:view": ["drivers:documents:read"],
  "drivers:documents:upload": ["drivers:documents:upload"],
  "drivers:documents:download": ["drivers:documents:download"],
  "drivers:documents:void": ["drivers:documents:void"],
  "drivers:documents:expiring": ["drivers:documents:expiring"],
} as const;

export type DriverPermissions = keyof typeof DriverModulePermissions;

// export type DriverPermissions = `drivers@${DriverPermissionsType}`;
