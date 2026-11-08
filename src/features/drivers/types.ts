import { EntityId } from "@/schemas"
import { VehicleBase } from "@/features/vehicles/types"

export type Driver = {
  id: EntityId
  number: string
  full_name: string
  user_name: string | undefined
  phone: string | undefined
  email: string
  rating: number
  created_at: Date
  updated_at: Date
  vehicle: VehicleBase | null
  photo_url: string | undefined
  licence_number: string | undefined
}
