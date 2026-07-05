// +++++++++++++++++++++++++++
// Reports permissions
export const ReportsModulePermissions = {
  "reports:module": ["reports:module"],
  "reports:create": ["reports:create"],
  "reports:view": ["reports:view", "reports:read"],
  "reports:delete": ["reports:delete"],
  "reports:edit": ["reports:update", "reports:view"],
} as const

export type ReportsPermissions = keyof typeof ReportsModulePermissions
