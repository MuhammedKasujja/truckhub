export const BillingModulePermissions = {
  "billing:module": ["billing:module", "billing:read"],
  "billing:create": ["billing:create"],
  "billing:view": ["billing:view", "billing:read"],
  "billing:delete": ["billing:delete"],
  "billing:edit": ["billing:update", "billing:view"],
} as const

export type BillingPermissions = keyof typeof BillingModulePermissions
