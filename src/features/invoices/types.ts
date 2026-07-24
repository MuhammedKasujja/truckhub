import { EntityId } from "@/schemas"

export type Invoice = {
  id: EntityId
  number: string
  total: string | number
  status: string
  amount_paid: string | number | null
  balance_due: string | number
  discount: string | number
  due_date: Date
  purpose: string | null
  created_at: Date
  line_items: []
  client: {
    id: EntityId
    number: string
    name: string
  }
}
