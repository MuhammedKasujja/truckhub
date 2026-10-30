import { EntityId } from "@/schemas"
import * as apiClient from "@/lib/api-client"
import { BankAccount } from "@/features/settings/bank-accounts/types"
import {
  BankAccountCreateInput,
  BankAccountUpdateInput,
} from "@/features/settings/bank-accounts/schemas"

const endpoint = "/v1/banks/accounts"

export async function getBankAccounts() {
  const { data, isSuccess, error } =
    await apiClient.getFn<BankAccount[]>(endpoint)
  return { data: isSuccess ? data! : [], error }
}

export async function getBankAccountById(accountId: EntityId) {
  return await apiClient.getFn<BankAccount>(`${endpoint}/${accountId}`)
}

export async function deleteBankAccountById(accountId: EntityId) {
  return await apiClient.deleteFn(`${endpoint}/${accountId}`)
}

export async function updateBankAccount(data: BankAccountUpdateInput) {
  const { id: accountId, ...rest } = data
  return await apiClient.putFn<BankAccount>(`${endpoint}/${accountId}`, rest)
}

export async function createBankAccount(data: BankAccountCreateInput) {
  return await apiClient.postFn<BankAccount>(endpoint, data)
}

export async function makeDefaultBankAccount(accountId: EntityId) {
  return await apiClient.postFn<BankAccount>(
    `${endpoint}/${accountId}/default`,
    {}
  )
}
