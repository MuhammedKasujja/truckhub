export const RideModulePermissions = {
  "rides:create": ["rides:create"],
  "rides:view": ["rides:list", "rides:single"],
  "rides:delete": ["rides:delete"],
  "rides:edit": ["rides:update"],
} as const;

export type RidePermissions = keyof typeof RideModulePermissions;

// export type RidePermissions = `rides@${RidePermissionsType}`;
