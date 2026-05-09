// sytem users

export const UserModulePermissions = {
  "users:create": ["users:create"],
  "users:view": ["users:list", "users:details"],
  "users:delete": ["users:delete"],
  "users:edit": ["users:update"],
} as const;

export type UserPermissions = keyof typeof UserModulePermissions;

// export type UserPermissions = `users@${UserPermissionsType}`;
