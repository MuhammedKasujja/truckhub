// +++++++++++++++++++++++++++
// Reports permissions
export const ReportsModulePermissions = {
  "reports:module": ["reports:module"],
  "reports:view": ["reports:view", "reports:read"],
  "reports:edit": ["reports:update", "reports:view"],
  "reports:audit_logs:view": ["audit_logs:read"],
  "reports:invoices:view": ["reports:module", "invoices:read"],
  "reports:quotations:view": ["reports:module", "quotations:read"],
  "reports:payments:view": ["reports:module", "payments:read"],
  "reports:shipments:view": ["reports:module", "trips:read"],
  "reports:pricings:view": ["reports:module", "services:read"],
} as const

export type ReportsPermissions = keyof typeof ReportsModulePermissions
