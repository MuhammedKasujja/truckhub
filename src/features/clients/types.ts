import { EntityId } from "@/schemas"

export type ClientContact = {
  id: EntityId
  name: string
  phone: string
  email?: string
  is_primary?: boolean
}

export type Customer = {
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
}

export type Client = Customer
