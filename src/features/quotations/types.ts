import { EntityId } from "@/schemas"

export type Quotation = {
  id: EntityId
  number: string
  amount: string | number
  last_updated_at: Date
  created_at: Date
  client: {
    id: EntityId
    number: string
    name: string
  }
}
