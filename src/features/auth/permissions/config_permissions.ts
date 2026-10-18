// +++++++++++++++++++++++++++
// settings permissions
export const ConfigModulePermissions = {
  "config:module": ["settings:module"],
  "config:create": ["settings:create"],
  "config:view": ["settings:view", "settings:read"],
  "config:edit": ["settings:update", "settings:view"],
  "config:roles:create": ["roles:update", "roles:create"],
  "config:company:update": ["companies:update"],
  "config:payment_terms:edit": [
    "settings:update",
    "settings:view",
    "settings:module",
  ],
  "config:roles:assign_permissions": ["roles:read", "roles:permissions:assign"],
  "config:manage_entity_numbers": [
    "settings:entity_numbers:update",
    "settings:entity_numbers:read",
  ],
  "config:vehicle_config:view": [],
  "config:user:management": ["users:view", "users:read", "roles:read"],
  // car_models routes
  "config:car_model:view": ["car_models:read", "car_models:view"],
  "config:car_model:create": ["car_models:create"],
  "config:car_model:delete": ["car_models:delete"],
  "config:car_model:edit": ["car_models:update"],
  // car_brands routes
  "config:car_brand:view": ["car_brands:read", "car_brands:view"],
  "config:car_brand:create": ["car_brands:create"],
  "config:car_brand:delete": ["car_brands:delete"],
  "config:car_brand:edit": ["car_brands:update"],
  // vehicle_types routes
  "config:vehicle_types:view": ["vehicle_types:read", "vehicle_types:view"],
  "config:vehicle_types:create": ["vehicle_types:create"],
  "config:vehicle_types:delete": ["vehicle_types:delete"],
  "config:vehicle_types:edit": ["vehicle_types:update"],
  // tax_rates routes
  "config:tax_rates:view": ["tax_rates:read", "tax_rates:view"],
  "config:tax_rates:create": ["tax_rates:create"],
  "config:tax_rates:delete": ["tax_rates:delete"],
  "config:tax_rates:edit": ["tax_rates:update"],
  // Booking routes
  "config:routes:read": ["routes:view", "routes:read"],
  "config:routes:create": ["routes:create"],
  "config:routes:delete": ["routes:delete"],
  "config:routes:edit": ["routes:update"],
  // Company Pricing
  "config:distance_pricing:delete": ["distance_tonnage:delete"],
  "config:loading_fees:delete": ["loading_offloading:delete"],
  "config:island_pricing:delete": ["island_pricings:delete"],

  // Vehicle Features
  "config:vehicle_features:edit": ["settings:update"],

  "config:pricing:manage": [
    "island_pricings:create",
    "island_pricings:update",
    "loading_offloading:create",
    "loading_offloading:update",
    "distance_tonnage:create",
    "distance_tonnage:update",
    "island_pricings:read",
    "island_pricings:view",
    "loading_offloading:read",
    "loading_offloading:view",
    "distance_tonnage:read",
    "distance_tonnage:view",
    "route_pricings:read",
  ],
  "config:pricing:view": [
    "route_pricings:active",
    "distance_tonnage:active",
    "island_pricings:active",
    "loading_offloading:active",
  ],
  "config:pricing:activate": [
    "route_pricings:activate",
    "distance_tonnage:active",
    "island_pricings:active",
    "loading_offloading:active",
  ],
  "config:banks:view": [
    "banks:view",
    "banks:read",
    "bank_accounts:read",
    "bank_accounts:view",
  ],
} as const

export type ConfigPermissions = keyof typeof ConfigModulePermissions

// export type ConfigPermissions = `settings@${ConfigPermissionsType}`;
