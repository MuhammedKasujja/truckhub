import { EntityId } from "@/schemas"
import { DataTableRowAction } from "@/types/data-table"

export type Invoice = {
  id: EntityId
  number: string
  total: string | number
  status: string
  amount_paid: string | number | null
  balance_due: number
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

export interface InvoiceTableRowAction extends DataTableRowAction<
  Invoice,
  "update" | "view" | "makePayment" | "email"
> {}
