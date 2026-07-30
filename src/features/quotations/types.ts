import { EntityId } from "@/schemas"
import { QuotationStatus } from "./enums"
import { LineItemResponse } from "./schemas"
import { DataTableRowAction } from "@/types/data-table"

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
      total_amount: number
      discount_amount: number
      discount: number
      tax_amount: number
      valid_until: string | null
      purpose: string | null
      is_active: boolean
      start_date: string
      end_date: string
      revision_reason: string | null
      line_items: LineItemResponse[],
      tax_rates: { id: EntityId; tax_name: string; rate: number }[]
    },
  ]
  client: {
    id: EntityId
    number: string
    name: string
  }
}

export interface QuotationTableRowAction extends DataTableRowAction<
  Quotation,
  "update" | "view"
> {}
