import type { EntityId } from "@/schemas"
import type { ClientType } from "@/config/constants"

export type ClientContact = {
  id: EntityId
  name: string
  phone: string
  email?: string
  is_primary?: boolean
}

export type FinancialSummary = {
  total_paid: string
  balance: string
  credit_available: string
  amount_due: string
}

export type Client = {
  id: EntityId
  number: string
  name: string
  short_name: string | undefined
  phone: string
  balance: string | number
  paid_to_date: string | number
  email: string
  created_at: Date
  updated_at: Date
  has_pricing: boolean
  contacts: ClientContact[]
  client_type: ClientType
  financial_summary: FinancialSummary | null
}

export type Customer = Client
