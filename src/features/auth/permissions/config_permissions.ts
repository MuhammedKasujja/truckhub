// +++++++++++++++++++++++++++
// settings permissions
export const ConfigModulePermissions = {
  "config:create": ["settings:create"],
  "config:view": ["settings:view_single", "settings:view_list"],
  "config:delete": ["settings:delete"],
  "config:edit": ["settings:update", "settings:view_single"],
  "config:view:audit_logs": ["settings:update", "settings:view_single"],
  "config:create:role": ["roles:update", "roles:create"],
} as const;

export type ConfigPermissions = keyof typeof ConfigModulePermissions;

// export type ConfigPermissions = `settings@${ConfigPermissionsType}`;
