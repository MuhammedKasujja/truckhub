// +++++++++++++++++++++++++++
// vehicles permissions
export const VehicleModulePermissions = {
  "vehicles:create": ["vehicles:create"],
  "vehicles:view": ["vehicles:view_single", "vehicles:view_list"],
  "vehicles:delete": ["vehicles:delete"],
  "vehicles:edit": ["vehicles:update", "vehicles:view_single"],
} as const;

export type VehiclePermissions = keyof typeof VehicleModulePermissions;

// export type VehiclePermissions = `vehicles@${VehiclePermissionsType}`;
