import { Briefcase, HandCoins, Landmark, Users } from "lucide-react"
import type { AccountPurpose, BankCountryCode, Currency } from "./enums"

export const accountPurposeMeta: Record<
  AccountPurpose,
  { label: string; description: string; icon: typeof Briefcase }
> = {
  operating: {
    label: "Operating",
    description: "Day-to-day income and expenses",
    icon: Briefcase,
  },
  payroll: {
    label: "Payroll",
    description: "Salaries and driver wages",
    icon: Users,
  },
  collections: {
    label: "Collections",
    description: "Client payments come in here",
    icon: HandCoins,
  },
  tax: {
    label: "Tax",
    description: "Set aside for tax payments",
    icon: Landmark,
  },
}

export const bankCountryMeta: Record<BankCountryCode, { label: string }> = {
  UG: { label: "Uganda" },
  US: { label: "United States" },
}

export const currencyMeta: Record<Currency, { label: string }> = {
  UGX: { label: "Ugandan shilling" },
  USD: { label: "US dollar" },
}
