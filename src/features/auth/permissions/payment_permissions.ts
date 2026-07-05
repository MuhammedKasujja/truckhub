export const PaymentModulePermissions = {
  "payments:module": ["payments:module", "payments:read"],
  "payments:create": ["payments:create"],
  "payments:view": ["payments:read", "payments:view"],
  "payments:delete": ["payments:delete"],
  "payments:edit": ["payments:update"],
} as const;

export type PaymentPermissions = keyof typeof PaymentModulePermissions;

// export type PaymentPermissions = `payments@${PaymentPermissionsType}`;
