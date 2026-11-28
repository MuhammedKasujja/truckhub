import type { EntityId } from "@/schemas"

export type Gender = "male" | "female"
export type EmploymentType = "full_time" | "part_time" | "contract" | "casual"
export type StaffStatus = "active" | "suspended" | "terminated"
export type PaymentMethod = "bank" | "mobile_money" | "cash"
export type LeaveRequestStatus = "pending" | "approved" | "rejected" | "cancelled"
export type PayComponentKind = "earning" | "deduction" | "employer_contribution"
export type PayCalcType = "fixed" | "percent_of_basic" | "percent_of_gross"
export type PayrollRunStatus = "draft" | "approved" | "paid" | "cancelled"
export type PayslipLineKind =
  | "basic"
  | "earning"
  | "deduction"
  | "tax"
  | "employer_contribution"

/** Money and day counts arrive as decimal strings, e.g. "1000000.00" and "5.0". */
export type DecimalString = string

/** Position codes the app relies on; companies can rename these positions but not re-code them. */
export const POSITION_CODES = { driver: "driver", mechanic: "mechanic" } as const

export type Position = {
  id: EntityId
  name: string
  code: string
  description: string | null
  is_active: boolean
  /** Driver and Mechanic: can be renamed, but not re-coded, deactivated or deleted. */
  is_system: boolean
  created_at: string
}

export type PositionSummary = Pick<Position, "id" | "name" | "code">

export type StaffSummary = {
  id: EntityId
  number: string | null
  name: string
  position?: PositionSummary | null
}

export type Department = {
  id: EntityId
  name: string
  code: string | null
  description: string | null
  is_active: boolean
  parent_id: EntityId | null
  head_staff_id: EntityId | null
  head: StaffSummary | null
  created_at: string
}

export type Staff = {
  id: EntityId
  number: string | null
  name: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  gender: Gender | null
  date_of_birth: string | null
  national_id: string | null
  tin: string | null
  nssf_number: string | null
  department_id: EntityId | null
  department: { id: EntityId; name: string } | null
  position_id: EntityId | null
  position: PositionSummary | null
  employment_type: EmploymentType
  status: StaffStatus
  hire_date: string
  termination_date: string | null
  termination_reason: string | null
  payment_method: PaymentMethod
  bank_name: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  mobile_money_number: string | null
  user_id: EntityId | null
  driver_id: EntityId | null
  has_system_access: boolean
  created_at: string
}

export type Compensation = {
  id: EntityId
  basic_salary: DecimalString
  effective_from: string
  effective_to: string | null
  notes: string | null
}

export type PayComponent = {
  id: EntityId
  code: string
  name: string
  kind: PayComponentKind
  calc_type: PayCalcType
  default_value: DecimalString
  is_taxable: boolean
  is_pre_tax: boolean
  is_statutory: boolean
  applies_to_all: boolean
  is_active: boolean
  sort_order: number
}

export type StaffPayComponent = {
  id: EntityId
  component_id: EntityId
  value: DecimalString | null
  is_active: boolean
  component: PayComponent
}

export type StaffCompensation = {
  current: Compensation | null
  history: Compensation[]
  components: StaffPayComponent[]
}

export type LeaveType = {
  id: EntityId
  code: string
  name: string
  days_per_year: DecimalString
  is_paid: boolean
  carry_forward_max: DecimalString
  applies_to_gender: Gender | null
  is_active: boolean
}

export type PublicHoliday = {
  id: EntityId
  holiday_date: string
  name: string
}

export type LeaveBalance = {
  leave_type_id: EntityId
  leave_type_code: string
  leave_type_name: string
  year: number
  entitled: DecimalString
  carried_forward: DecimalString
  adjusted: DecimalString
  taken: DecimalString
  pending: DecimalString
  available: DecimalString
}

export type LeaveRequest = {
  id: EntityId
  staff_id: EntityId
  staff: StaffSummary
  leave_type_id: EntityId
  leave_type: LeaveType
  start_date: string
  end_date: string
  days: DecimalString
  reason: string | null
  status: LeaveRequestStatus
  requested_by_id: EntityId | null
  decided_by_id: EntityId | null
  decided_at: string | null
  decision_note: string | null
  created_at: string
}

export type TaxBand = {
  id: EntityId
  lower_bound: DecimalString
  upper_bound: DecimalString | null
  rate_percent: DecimalString
}

export type PayslipLine = {
  id: EntityId
  code: string
  name: string
  kind: PayslipLineKind
  amount: DecimalString
  is_taxable: boolean
  is_manual: boolean
}

export type PayslipSummary = {
  id: EntityId
  run_id: EntityId
  staff_id: EntityId
  staff_name: string
  staff_number: string | null
  department_name: string | null
  basic_salary: DecimalString
  gross_pay: DecimalString
  tax: DecimalString
  total_deductions: DecimalString
  net_pay: DecimalString
  employer_contributions: DecimalString
}

export type Payslip = PayslipSummary & {
  job_title: string | null
  payment_method: string | null
  bank_name: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  mobile_money_number: string | null
  taxable_pay: DecimalString
  lines: PayslipLine[]
}

/** A payslip as its owner sees it, with the month it is for. */
export type MyPayslip = Payslip & {
  period_year: number
  period_month: number
  paid_on: string | null
}

export type PayrollRun = {
  id: EntityId
  number: string | null
  period_year: number
  period_month: number
  status: PayrollRunStatus
  total_gross: DecimalString
  total_deductions: DecimalString
  total_net: DecimalString
  total_employer_contributions: DecimalString
  approved_by_id: EntityId | null
  approved_at: string | null
  paid_on: string | null
  notes: string | null
  created_at: string
}

export type PayrollRunDetail = PayrollRun & { payslips: PayslipSummary[] }

export type SkippedStaff = { staff_id: EntityId; name: string; reason: string }

export type PayrollGenerateResult = {
  run: PayrollRunDetail
  skipped: SkippedStaff[]
}
