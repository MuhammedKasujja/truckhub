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
  "config:pricing_plans:view": [],
  "config:vehicle_config:view": [],
  "config:user:management": ["users:view", "users:read", "roles:read",],
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
  // Distance Pricing routes
  "config:distance_pricing:view": [
    "distance_tonnage:read",
    "distance_tonnage:view",
  ],
  "config:distance_pricing:create": ["distance_tonnage:create"],
  "config:distance_pricing:delete": ["distance_tonnage:delete"],
  "config:distance_pricing:edit": ["distance_tonnage:update"],
  // Loading Fees routes
  "config:loading_fees:view": [
    "loading_offloading:read",
    "loading_offloading:view",
  ],
  "config:loading_fees:create": ["loading_offloading:create"],
  "config:loading_fees:delete": ["loading_offloading:delete"],
  "config:loading_fees:edit": ["loading_offloading:update"],
  // Island Pricings
  "config:island_pricing:view": [
    "island_pricings:read",
    "island_pricings:view",
  ],
  "config:island_pricing:create": ["island_pricings:create"],
  "config:island_pricing:delete": ["island_pricings:delete"],
  "config:island_pricing:edit": ["island_pricings:update"],

  // Vehicle Features
  "config:vehicle_features:edit": ["settings:update"],
} as const

export type ConfigPermissions = keyof typeof ConfigModulePermissions

// export type ConfigPermissions = `settings@${ConfigPermissionsType}`;
