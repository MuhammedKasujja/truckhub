import { VehicleBase } from "@/features/vehicles/types";

export type Driver = {
  id: number;
  number: string;
  fullname: string;
  first_name: string;
  last_name: string;
  user_name: string | undefined;
  phone: string;
  email: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
  vehicle: VehicleBase | null;
};
