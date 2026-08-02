export const ShipmentModulePermissions = {
  "shipments:module": ["shipments:module"],
} as const;

export type ShipmentPermissions = keyof typeof ShipmentModulePermissions;

