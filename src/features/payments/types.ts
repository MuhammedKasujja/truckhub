import {
  PaymentType,
  PaymentModeList,
  PaymentStatuses,
} from "@/config/constants"
import { EntityId } from "@/schemas"
import { DataTableRowAction } from "@/types/data-table"

export type PaymentMode = (typeof PaymentModeList)[number]

export type PaymentStatus = (typeof PaymentStatuses)[number]

export type PaymentableEntity = {
  id: EntityId
  number: string
  amount: string
  balance: string
}
export type PaymentCustomer = {
  id: EntityId
  fullname: string
  phone: string
  email: string
}

export type Payment = {
  id: EntityId
  amount: number
  number: string
  method: PaymentMode
  applied: number
  refunded: number
  entity_id: EntityId
  entity_type: PaymentType
  status: PaymentStatus
  paid_at: Date
  transaction_ref: string | null
  entity: PaymentableEntity
  client: PaymentCustomer
  created_at: Date
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
