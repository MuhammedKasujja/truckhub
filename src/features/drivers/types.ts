import { EntityId } from "@/schemas"
import { VehicleSummary } from "@/features/vehicles/types"

export type Driver = {
  id: EntityId
  number: string
  full_name: string
  user_name: string | undefined
  phone: string | undefined
  national_id: string
  date_of_birth: string
  email: string
  rating: number
  created_at: Date
  updated_at: Date
  vehicle: VehicleSummary | null
  photo_url: string | undefined
  licence_number: string | undefined
}
