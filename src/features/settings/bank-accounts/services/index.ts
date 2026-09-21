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

export const getBanksFn = createServerFn().handler(async () => {
  const response = await getBanks()
  return response.data
})

export const getBankDetailsFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getBankById(data.id)
  })

export const deleteBankFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteBankById(data.id)
  })

export const updateBankFn = createServerFn()
  .inputValidator(bankDetailsUpdateSchema)
  .handler(async ({ data }) => {
    return updateBankDetails(data)
  })

export const createBankFn = createServerFn()
  .inputValidator(bankDetailsCreateSchema)
  .handler(async ({ data }) => {
    return createBank(data)
  })

export const getBankAccountsFn = createServerFn().handler(() =>
  getBankAccounts()
)

export const getBankAccountFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getBankAccountById(data.id)
  })

export const deleteBankAccountFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteBankAccountById(data.id)
  })

export const updateBankAccountFn = createServerFn()
  .inputValidator(bankAccountUpdateSchema)
  .handler(async ({ data }) => {
    return updateBankAccount(data)
  })

export const createBankAccountFn = createServerFn()
  .inputValidator(bankAccountCreateSchema)
  .handler(async ({ data }) => {
    return createBankAccount(data)
  })

export const makeDefaultBankAccountFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return makeDefaultBankAccount(data.id)
  })
