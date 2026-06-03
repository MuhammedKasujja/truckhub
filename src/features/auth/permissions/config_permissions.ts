// +++++++++++++++++++++++++++
// settings permissions
export const ConfigModulePermissions = {
  "config:create": ["settings:create"],
  "config:view": ["settings:view", "settings:read"],
  "config:delete": ["settings:delete"],
  "config:edit": ["settings:update", "settings:view"],
  "config:view:audit_logs": ["settings:update", "settings:view"],
  "config:roles:create": ["roles:update", "roles:create"],
  "config:roles:assign_permissions": ["roles:read", "roles:permissions:assign"],
} as const;

export type ConfigPermissions = keyof typeof ConfigModulePermissions;

// export type ConfigPermissions = `settings@${ConfigPermissionsType}`;
