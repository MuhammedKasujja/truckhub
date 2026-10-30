export const InvoiceModulePermissions = {
  "invoices:module": ["invoices:module", "invoices:read"],
  "invoices:create": ["invoices:create"],
  "invoices:view": ["invoices:view", "invoices:read"],
  "invoices:delete": ["invoices:delete"],
  "invoices:edit": ["invoices:update", "invoices:view"],
  "invoices:pdf": ["invoices:pdf"],
  "invoices:email": ["invoices:email"],
} as const

export type InvoicePermissions = keyof typeof InvoiceModulePermissions
