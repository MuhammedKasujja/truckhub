import { EntityId } from "@/schemas"
import { DataTableRowAction } from "@/types/data-table"

export type InvoiceLineItem = {
  unit_price: string
  line_total: string
  quantity: number
  description: string
  service_days: number
  fuel_surcharge: string
  loading_charge: string | null
  offloading_charge: string | null
}

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
  line_items: InvoiceLineItem[]
  client: {
    id: EntityId
    number: string
    name: string
    short_name: string | null
  }
}

export interface InvoiceTableRowAction extends DataTableRowAction<
  Invoice,
  "update" | "view" | "makePayment" | "email"
> {}
