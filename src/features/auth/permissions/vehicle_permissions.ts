// +++++++++++++++++++++++++++
// vehicles permissions
export const VehicleModulePermissions = {
  "vehicles:create": ["vehicles:create"],
  "vehicles:view": ["vehicles:view", "vehicles:read"],
  "vehicles:delete": ["vehicles:delete"],
  "vehicles:edit": ["vehicles:update", "vehicles:view"],
  "vehicles:unassign": ["vehicles:driver:unassign"],
  "vehicles:assign": ["vehicles:driver:assign"],
} as const

export type VehiclePermissions = keyof typeof VehicleModulePermissions

// export type VehiclePermissions = `vehicles@${VehiclePermissionsType}`;
