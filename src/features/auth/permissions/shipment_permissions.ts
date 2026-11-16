export const ShipmentModulePermissions = {
  "shipments:module": ["shipments:module", "trips:read", "trips:view"],
  "shipments:dispatch": ["trips:dispatch"],
  "shipments:complete": ["trips:end"],
  "shipments:capture_details": ["trips:details"],
  "shipments:asssign_driver": ["trips:asssign_driver"],
  "shipments:asssign_vehicle": ["trips:asssign_vehicle"],
  "shipments:cancel": ["trips:cancel"],
  "shipments:active": ["shipments:module", "trips:read",],
} as const

export type ShipmentPermissions = keyof typeof ShipmentModulePermissions
