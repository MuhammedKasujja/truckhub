export const QuotationModulePermissions = {
  "quotations:module": ["quotations:module"],
  "quotations:create": ["quotations:create"],
  "quotations:view": ["quotations:view", "quotations:read"],
  "quotations:delete": ["quotations:delete"],
  "quotations:edit": ["quotations:update", "quotations:view"],
  "quotations:reject": ["quotations:reject"],
  "quotations:accept": ["quotations:accept"],
  "quotations:email": ["quotations:email"],
  "quotations:activities": ["quotations:activities"],
  "quotations:cancel": ["quotations:cancel"],
} as const

export type QuotationPermissions = keyof typeof QuotationModulePermissions
