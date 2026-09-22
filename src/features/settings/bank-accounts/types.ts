import { EntityId } from "@/schemas"
import { AccountPurpose, BankCountryCode, Currency } from "./enums"

export type Bank = {
  id: EntityId
  name: string
  country: BankCountryCode
  swift_code: string | undefined
}

export type BankAccount = {
  id: EntityId
  bank_id: EntityId
  branch: string
  account_name: string
  account_number: string
  currency: Currency
  purpose: AccountPurpose
  show_on_invoices: boolean
}
