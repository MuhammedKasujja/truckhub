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
} as const

export type MaintenancePermissions = keyof typeof MaintenanceModulePermissions
