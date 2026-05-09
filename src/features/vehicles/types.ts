export const EngineTypes = ["petrol", "desel"] as const;
export const Gearboxes = ["manual", "automatic"] as const;

export type Engine = (typeof EngineTypes)[number];
export type Gearbox = (typeof Gearboxes)[number];

export type VehicleDriver = {
  id: number;
  name: string;
  email: string
  phone: string
};

export interface VehicleBase {
  id: number;
  display_name: string;
  number: string;
  plate_number: string;
  color: string;
  interior_color: string;
  cylinders: number;
  tank_capacity: number;
  engine_type: Engine;
  gearbox: Gearbox;
  year: string;
  seats: number;
  vehicle_type_id: number;
  car_model_id: number;
  drive_train_id: number;
  tonnage_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Vehicle extends VehicleBase {
  driver: VehicleDriver | null;
}
