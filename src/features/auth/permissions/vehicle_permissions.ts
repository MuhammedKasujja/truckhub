// +++++++++++++++++++++++++++
// vehicles permissions
export const VehicleModulePermissions = {
  "vehicles:create": ["vehicles:create"],
  "vehicles:view": ["vehicles:view", "vehicles:read"],
  "vehicles:delete": ["vehicles:delete"],
  "vehicles:edit": ["vehicles:update", "vehicles:view"],
} as const;

export type VehiclePermissions = keyof typeof VehicleModulePermissions;

// export type VehiclePermissions = `vehicles@${VehiclePermissionsType}`;
