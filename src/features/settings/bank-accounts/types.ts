import { EntityId } from "@/schemas"

export type Bank = {
  id: EntityId
  name: string
}

export type BankAccount = {
  id: EntityId
  bank_id: EntityId
  branch: string
  account_name: string
  account_number: string
}
