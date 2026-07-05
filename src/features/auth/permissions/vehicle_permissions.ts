// +++++++++++++++++++++++++++
// vehicles permissions
export const VehicleModulePermissions = {
  "vehicles:module": ["vehicles:module", "vehicles:read"],
  "vehicles:create": ["vehicles:create"],
  "vehicles:view": ["vehicles:view", "vehicles:read"],
  "vehicles:delete": ["vehicles:delete"],
  "vehicles:edit": ["vehicles:update", "vehicles:view"],
  "vehicles:unassign": ["vehicles:driver:unassign"],
  "vehicles:assign": ["vehicles:driver:assign"],
  "vehicles:change_status": ["vehicles:change_status"],
} as const

export type VehiclePermissions = keyof typeof VehicleModulePermissions

// export type VehiclePermissions = `vehicles@${VehiclePermissionsType}`;
