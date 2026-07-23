import { EntityId } from "@/schemas"
import { QuotationStatus } from "./enums"

export type Quotation = {
  id: EntityId
  number: string
  status: QuotationStatus
  amount: string | number
  last_updated_at: Date
  created_at: Date
  versions: [
    {
      version_number: number
      subtotal: number
      total: number
      tax_amount: number
      valid_until: string
      purpose: string | null
      is_active: boolean
      line_items: [
        {
          unit_price: number
          subtotal: number
          line_total: number
          quantity: number
          discount: number | null
          item_type: string | null
          vehicle_year: string | null
          car_brand_id: EntityId | null
          car_model_id: EntityId | null
          tonnage: number | null
          engine_mode: string | null
          with_loaders: boolean
          with_driver: boolean
          estimated_consumption_rate_km: number | null
          vehicle_addons: [{ id: EntityId; name: string }]
          services: []
        },
      ]
    },
  ]
  client: {
    id: EntityId
    number: string
    name: string
  }
}
