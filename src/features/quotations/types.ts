import { EntityId } from "@/schemas"
import { QuotationStatus } from "./enums"

export type Quotation = {
  id: EntityId
  number: string
  status: QuotationStatus
  amount: string | number
  last_updated_at: Date
  created_at: Date
  client: {
    id: EntityId
    number: string
    name: string
  }
}
