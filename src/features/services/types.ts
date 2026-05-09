export const DistanceUnitList = ["km", "miles"] as const;

export type DistanceUnit = (typeof DistanceUnitList)[number];

export type Service = {
  name: string;
  category: string;
  display_name: string;
  seats: number;
  base_fare: number;
  min_fare: number;
  price_per_min: number;
  price_per_unit_distance: number;
  booking_fee: number;
  tax_fee: number;
  distance_unit: DistanceUnit;
  vehicle_type_id: number;
  description: string | undefined;
  id: number;
  is_truck: boolean;
  created_at: Date;
  updated_at: Date;
};

export type ServiceGroup = {
  category: string;
  is_truck: boolean;
  services: Service[];
};
