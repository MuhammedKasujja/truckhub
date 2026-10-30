export const accountPurposes = [
  "operating",
  "payroll",
  "collections",
  "tax",
] as const


export const currencies = ["UGX", "USD"] as const

export const bankCountryCodes = ["UG", "US"] as const

export type AccountPurpose = (typeof accountPurposes)[number]

export type Currency = (typeof currencies)[number]

export type BankCountryCode = (typeof bankCountryCodes)[number]
