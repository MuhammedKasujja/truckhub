import {
  PaymentType,
  PaymentModeList,
  PaymentStatuses,
} from "@/config/constants"
import { EntityId } from "@/schemas"
import { DataTableRowAction } from "@/types/data-table"

export type PaymentMode = (typeof PaymentModeList)[number]

export type PaymentStatus = (typeof PaymentStatuses)[number]

/** What a payment was made for. Payments are recorded against invoices. */
export type PaymentableEntity = {
  id: EntityId
  number: string
  total: string
  balance_due: string
}
export type PaymentCustomer = {
  id: EntityId
  number: string
  fullname: string
  phone: string | null
  email: string
}

export type Payment = {
  id: EntityId
  amount: number
  number: string
  method: PaymentMode
  applied: number
  entity_id: EntityId
  entity_type: PaymentType
  status: PaymentStatus
  status_reason: string | null
  paid_at: Date
  /** Set once the payment has been reversed. */
  reversed_at: string | null
  transaction_ref: string | null
  entity: PaymentableEntity
  client: PaymentCustomer
}

type PaymentStat = {
  newValue: number | string
  oldValue: number | string
}

export type PaymentStatistics = {
  monthly: PaymentStat
  weekly: PaymentStat
  yearly: PaymentStat
}

export interface PaymentTableRowAction extends DataTableRowAction<
  Payment,
  "update" | "view" | "delete" | "reverse"
> {}
