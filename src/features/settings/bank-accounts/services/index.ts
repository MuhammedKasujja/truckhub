import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  getBankAccountById,
  deleteBankAccountById,
  makeDefaultBankAccount,
} from "./bank_accounts"
import {
  getBanks,
  createBank,
  getBankById,
  deleteBankById,
  updateBankDetails,
} from "./banks"
import {
  bankAccountCreateSchema,
  bankAccountUpdateSchema,
  bankDetailsCreateSchema,
  bankDetailsUpdateSchema,
} from "../schemas"
import { ApiError } from "@/types"

export const getBanksFn = createServerFn().handler(async () => {
  const response = await getBanks()
  return response.data
})

export const getBankDetailsFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getBankById(data.id)
  })

export const deleteBankFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteBankById(data.id)
  })

export const updateBankFn = createServerFn()
  .validator(bankDetailsUpdateSchema)
  .handler(async ({ data }) => {
    return updateBankDetails(data)
  })

export const createBankFn = createServerFn()
  .validator(bankDetailsCreateSchema)
  .handler(async ({ data }) => {
    return createBank(data)
  })

export const getBankAccountsFn = createServerFn().handler(async () => {
  const respone = await getBankAccounts()
  if (respone.error) {
    throw new ApiError(respone.error.message, respone.error.statusCode)
  }
  return respone.data
})

export const getBankAccountFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getBankAccountById(data.id)
  })

export const deleteBankAccountFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteBankAccountById(data.id)
  })

export const updateBankAccountFn = createServerFn()
  .validator(bankAccountUpdateSchema)
  .handler(async ({ data }) => {
    return updateBankAccount(data)
  })

export const createBankAccountFn = createServerFn()
  .validator(bankAccountCreateSchema)
  .handler(async ({ data }) => {
    return createBankAccount(data)
  })

export const makeDefaultBankAccountFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return makeDefaultBankAccount(data.id)
  })
