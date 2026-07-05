// +++++++++++++++++++++++++++
// settings permissions
export const ConfigModulePermissions = {
  "config:module": ["settings:module"],
  "config:create": ["settings:create"],
  "config:view": ["settings:view", "settings:read"],
  "config:edit": ["settings:update", "settings:view"],
  "config:view:audit_logs": ["settings:update", "settings:view"],
  "config:roles:create": ["roles:update", "roles:create"],
  "config:company:update": ["companies:update"],
  "config:roles:assign_permissions": ["roles:read", "roles:permissions:assign"],
  "config:manage_entity_numbers": [
    "settings:entity_numbers:update",
    "settings:entity_numbers:read",
  ],
  // car_models routes
  "config:car_model:create": ["car_models:create"],
  "config:car_model:delete": ["car_models:delete"],
  "config:car_model:edit": ["car_models:update"],
  // car_brands routes
  "config:car_brand:create": ["car_brands:create"],
  "config:car_brand:delete": ["car_brands:delete"],
  "config:car_brand:edit": ["car_brands:update"],
  // vehicle_types routes
  "config:vehicle_types:create": ["vehicle_types:create"],
  "config:vehicle_types:delete": ["vehicle_types:delete"],
  "config:vehicle_types:edit": ["vehicle_types:update"],
  // tax_rates routes
  "config:tax_rates:create": ["tax_rates:create"],
  "config:tax_rates:delete": ["tax_rates:delete"],
  "config:tax_rates:edit": ["tax_rates:update"],
  // booking routes
  "config:routes:create": ["routes:create"],
  "config:routes:delete": ["routes:delete"],
  "config:routes:edit": ["routes:update"],
} as const

export type ConfigPermissions = keyof typeof ConfigModulePermissions

// export type ConfigPermissions = `settings@${ConfigPermissionsType}`;
