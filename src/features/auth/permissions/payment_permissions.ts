export const PaymentModulePermissions = {
  "payments:create": ["payments:create"],
  "payments:view": ["payments:list", "payments:single"],
  "payments:delete": ["payments:delete"],
  "payments:edit": ["payments:update"],
} as const;

export type PaymentPermissions = keyof typeof PaymentModulePermissions;

// export type PaymentPermissions = `payments@${PaymentPermissionsType}`;
