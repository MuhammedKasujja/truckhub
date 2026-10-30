import { EntityId } from "@/schemas"
import * as apiClient from "@/lib/api-client"
import { Bank } from "@/features/settings/bank-accounts/types"
import {
  BankDetailsCreateInput,
  BankDetailsUpdateInput,
} from "@/features/settings/bank-accounts/schemas"

const endpoint = "/v1/banks"

export async function getBanks() {
  const { data, isSuccess, error } = await apiClient.getFn<Bank[]>(endpoint)
  return { data: isSuccess ? data! : [], error }
}

export async function getBankById(bankId: EntityId) {
  return await apiClient.getFn<Bank>(`${endpoint}/${bankId}`)
}

export async function deleteBankById(bankId: EntityId) {
  return await apiClient.deleteFn(`${endpoint}/${bankId}`)
}

export async function updateBankDetails(data: BankDetailsUpdateInput) {
  const { id: bankId, ...rest } = data
  return await apiClient.putFn<Bank>(`${endpoint}/${bankId}`, rest)
}

export async function createBank(data: BankDetailsCreateInput) {
  return await apiClient.postFn<Bank>(endpoint, data)
}
