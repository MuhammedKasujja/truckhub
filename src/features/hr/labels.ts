import type {
  EmploymentType,
  Gender,
  LeaveRequestStatus,
  PayCalcType,
  PayComponent,
  PayComponentKind,
  PaymentMethod,
  PayrollRunStatus,
  StaffStatus,
} from "./types"
import { formatMoney } from "@/lib/format"

type Option<T extends string> = { value: T; label: string }

const options = <T extends string>(labels: Record<T, string>): Option<T>[] =>
  (Object.entries(labels) as [T, string][]).map(([value, label]) => ({
    value,
    label,
  }))

export const GENDER_LABELS: Record<Gender, string> = {
  female: "Female",
  male: "Male",
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full time",
  part_time: "Part time",
  contract: "Contract",
  casual: "Casual",
}

export const STAFF_STATUS_LABELS: Record<StaffStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  terminated: "Terminated",
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank: "Bank transfer",
  mobile_money: "Mobile money",
  cash: "Cash",
}

export const LEAVE_STATUS_LABELS: Record<LeaveRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
}

export const COMPONENT_KIND_LABELS: Record<PayComponentKind, string> = {
  earning: "Earning",
  deduction: "Deduction",
  employer_contribution: "Employer contribution",
}

export const CALC_TYPE_LABELS: Record<PayCalcType, string> = {
  fixed: "Fixed amount",
  percent_of_basic: "% of basic pay",
  percent_of_gross: "% of gross pay",
}

export const RUN_STATUS_LABELS: Record<PayrollRunStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  paid: "Paid",
  cancelled: "Cancelled",
}

export const GENDER_OPTIONS = options(GENDER_LABELS)
export const EMPLOYMENT_TYPE_OPTIONS = options(EMPLOYMENT_TYPE_LABELS)
export const STAFF_STATUS_OPTIONS = options(STAFF_STATUS_LABELS)
export const PAYMENT_METHOD_OPTIONS = options(PAYMENT_METHOD_LABELS)
export const LEAVE_STATUS_OPTIONS = options(LEAVE_STATUS_LABELS)
export const COMPONENT_KIND_OPTIONS = options(COMPONENT_KIND_LABELS)
export const CALC_TYPE_OPTIONS = options(CALC_TYPE_LABELS)

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export const MONTH_OPTIONS = MONTHS.map((label, index) => ({
  value: String(index + 1),
  label,
}))

/** "November 2026" */
export function formatPeriod(year: number, month: number) {
  return `${MONTHS[month - 1] ?? month} ${year}`
}

/** "5 days", "1 day", "2.5 days" from a decimal string such as "5.0". */
export function formatDays(value: string | number) {
  const days = Number(value)
  return `${days} ${days === 1 ? "day" : "days"}`
}

/** "5%" or a money amount, depending on how the component is calculated. */
export function formatComponentValue(
  component: Pick<PayComponent, "calc_type">,
  value: string | number
) {
  return component.calc_type === "fixed"
    ? formatMoney(value)
    : `${Number(value)}% of ${component.calc_type === "percent_of_basic" ? "basic" : "gross"}`
}
