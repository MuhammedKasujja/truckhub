import { EntityId } from "@/schemas"
import { DataTableRowAction } from "@/types/data-table"
import { LineItemResponse } from "../quotations/schemas"

export type Invoice = {
  id: EntityId
  number: string
  total: string
  status: string
  amount_paid: string | null
  balance_due: string
  discount: string | null
  due_date: Date
  purpose: string | null
  created_at: Date
  line_items: LineItemResponse[]
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
