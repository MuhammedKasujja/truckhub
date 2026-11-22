export const ShipmentModulePermissions = {
  "shipments:module": ["shipments:module"],
  // The shipments list and its widgets read trips
  "shipments:view": ["trips:read", "trips:view"],
  "shipments:dispatch": ["trips:dispatch"],
  "shipments:complete": ["trips:end"],
  "shipments:capture_details": ["trips:details"],
  "shipments:asssign_driver": ["trips:asssign_driver"],
  "shipments:asssign_vehicle": ["trips:asssign_vehicle"],
  "shipments:cancel": ["trips:cancel"],
  "shipments:report_delay": ["trips:delay"],
  "shipments:active": ["shipments:module", "trips:read",],
} as const

export type ShipmentPermissions = keyof typeof ShipmentModulePermissions
