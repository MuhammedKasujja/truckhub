// +++++++++++++++++++++++++++
// Maintenance permissions
export const MaintenanceModulePermissions = {
  "maintenance:module": ["maintenance:module"],
  "maintenance:view": [
    "maintenance:view",
    "maintenance:read",
    "maintenance:board",
  ],
  "maintenance:create": ["maintenance:create", "maintenance:view"],
  "maintenance:edit": ["maintenance:update", "maintenance:view"],
  "maintenance:change_status": ["maintenance:change_status"],
  // The mechanic list comes from HR staff in the Mechanic position
  "maintenance:assign_mechanics": [
    "maintenance:assign_mechanic",
    "maintenance:unassign_mechanic",
    "maintenance:set_lead_mechanic",
    "staff:read",
  ],
} as const

export type MaintenancePermissions = keyof typeof MaintenanceModulePermissions
