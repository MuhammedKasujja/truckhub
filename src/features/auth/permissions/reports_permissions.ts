// +++++++++++++++++++++++++++
// Reports permissions
export const ReportsModulePermissions = {
  "reports:module": ["reports:module"],
  "reports:view": ["reports:view", "reports:read"],
  "reports:edit": ["reports:update", "reports:view"],
  "reports:audit_logs:view": ["audit_logs:read"],
} as const

export type ReportsPermissions = keyof typeof ReportsModulePermissions
