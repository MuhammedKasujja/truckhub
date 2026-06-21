// +++++++++++++++++++++++++++
// settings permissions
export const ConfigModulePermissions = {
  "config:create": ["settings:create"],
  "config:view": ["settings:view", "settings:read"],
  "config:edit": ["settings:update", "settings:view"],
  "config:view:audit_logs": ["settings:update", "settings:view"],
  "config:roles:create": ["roles:update", "roles:create"],
  "config:company:update": ["companies:update"],
  "config:roles:assign_permissions": ["roles:read", "roles:permissions:assign"],
} as const

export type ConfigPermissions = keyof typeof ConfigModulePermissions

// export type ConfigPermissions = `settings@${ConfigPermissionsType}`;
