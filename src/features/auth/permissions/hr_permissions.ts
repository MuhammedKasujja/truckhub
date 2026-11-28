// +++++++++++++++++++++++++++
// HR permissions: staff, departments, leave and payroll

const STAFF_VIEW = ["staff:read", "staff:view", "departments:read"] as const

const SETUP_VIEW = [
  "leave-types:read",
  "public-holidays:read",
  "pay-components:read",
  "tax-bands:read",
] as const

export const HrModulePermissions = {
  "hr:module": ["hr:module"],

  "hr:staff:view": STAFF_VIEW,
  // Picking a position needs the position list
  "hr:staff:create": ["staff:create", "positions:read", ...STAFF_VIEW],
  "hr:staff:edit": ["staff:update", "positions:read", ...STAFF_VIEW],
  "hr:staff:delete": ["staff:delete"],
  "hr:staff:terminate": ["staff:terminate"],
  "hr:staff:access": ["staff:access:grant", "staff:access:revoke"],
  "hr:compensation:view": ["staff:compensation:read"],
  "hr:compensation:edit": [
    "staff:compensation:read",
    "staff:compensation:update",
    "staff:components:update",
    "pay-components:read",
  ],
  "hr:departments:manage": [
    "departments:read",
    "departments:view",
    "departments:create",
    "departments:update",
    "departments:delete",
  ],

  "hr:positions:manage": [
    "positions:read",
    "positions:view",
    "positions:create",
    "positions:update",
    "positions:delete",
  ],

  "hr:leave:view": [
    "leave-requests:read",
    "leave-requests:view",
    "leave-types:read",
    "leave-balances:read",
  ],
  "hr:leave:file": ["leave-requests:create", "leave-requests:cancel"],
  "hr:leave:approve": ["leave-requests:approve", "leave-requests:reject"],
  "hr:leave:balances": ["leave-balances:read", "leave-balances:adjust"],

  "hr:payroll:view": ["payroll-runs:read", "payroll-runs:view", "payslips:view"],
  "hr:payroll:manage": [
    "payroll-runs:create",
    "payroll-runs:generate",
    "payroll-runs:cancel",
    "payslips:lines:create",
    "payslips:lines:delete",
  ],
  "hr:payroll:approve": ["payroll-runs:approve", "payroll-runs:pay"],

  "hr:setup:view": SETUP_VIEW,
  "hr:setup:manage": [
    ...SETUP_VIEW,
    "leave-types:create",
    "leave-types:update",
    "leave-types:delete",
    "public-holidays:create",
    "public-holidays:delete",
    "pay-components:create",
    "pay-components:update",
    "pay-components:delete",
    "tax-bands:replace",
  ],
} as const

export type HrPermissions = keyof typeof HrModulePermissions

/**
 * Self-service needs a login and nothing else: the API only ever returns the
 * caller's own staff record, leave and payslips. The empty list means every
 * signed-in user passes, and it stays out of the role permission matrix.
 */
export const SelfServicePermissions = {
  "me:view": [],
} as const
