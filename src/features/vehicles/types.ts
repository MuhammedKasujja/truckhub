import { EntityId } from "@/schemas"

export const EngineTypes = ["petrol", "desel"] as const
export const Gearboxes = ["manual", "automatic"] as const

export type Engine = (typeof EngineTypes)[number]
export type Gearbox = (typeof Gearboxes)[number]

export type VehicleDriver = {
  id: EntityId
  name: string
  email: string
  phone: string
  number: string
}

export interface VehicleBase {
  id: EntityId
  display_name: string
  number: string
  plate_number: string
  color: string
  interior_color: string
  cylinders: number
  tank_capacity: number
  engine_type: Engine
  gearbox: Gearbox
  year: string
  seats: number
  vehicle_type_id: EntityId
  car_model_id: EntityId
  drive_train_id: EntityId
  consumption_rate: number
  tonnage_id: EntityId
  created_at: Date
  updated_at: Date
  second_plate_number?: string
  tonnage_capacity?: number
  total_axles?: number
}

export interface Vehicle extends VehicleBase {
  driver: VehicleDriver | null
  vehicle_type: {
    id: EntityId
    name: string
    is_truck: boolean
  }
  car_model: {
    id: EntityId
    name: string
    car_brand: {
      id: EntityId
      name: string
    }
  }
  drive_train: {
    id: EntityId
    name: string
  }
  features: {
    id: EntityId
    name: string
  }[]
}
