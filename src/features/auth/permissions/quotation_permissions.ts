export const QuotationModulePermissions = {
  "quotations:module": ["quotations:module", "quotations:read"],
  "quotations:create": ["quotations:create"],
  "quotations:view": ["quotations:view", "quotations:read"],
  "quotations:delete": ["quotations:delete"],
  "quotations:edit": ["quotations:update", "quotations:view"],
  "quotations:reject": ["quotations:reject"],
  "quotations:accept": ["quotations:reject"],
  "quotations:email": ["quotations:email"],
} as const

export type QuotationPermissions = keyof typeof QuotationModulePermissions
