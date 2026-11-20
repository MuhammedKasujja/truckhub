"use server"

import type z from "zod"
import type { EntityId } from "@/schemas"
import type {
  CompensationSetSchema,
  DepartmentCreateSchema,
  DepartmentUpdateSchema,
  LeaveBalanceAdjustSchema,
  LeaveDecisionSchema,
  LeaveRequestCreateSchema,
  LeaveRequestSearch,
  LeaveTypeCreateSchema,
  LeaveTypeUpdateSchema,
  MyLeaveRequestSchema,
  PayComponentCreateSchema,
  PayComponentUpdateSchema,
  PayrollRunCreateSchema,
  PayrollRunPaySchema,
  PayrollRunSearch,
  PayslipLineCreateSchema,
  PayslipLineRemoveSchema,
  PublicHolidayCreateSchema,
  StaffComponentsSetSchema,
  StaffCreateSchema,
  StaffSearch,
  StaffTerminateSchema,
  StaffUpdateSchema,
  SystemAccessGrantSchema,
  TaxBandsReplaceSchema,
} from "../schemas"
import type {
  Department,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  MyPayslip,
  PayComponent,
  PayrollGenerateResult,
  PayrollRun,
  PayrollRunDetail,
  Payslip,
  PublicHoliday,
  Staff,
  StaffCompensation,
  TaxBand,
} from "../types"
import * as apiClient from "@/lib/api-client"
import { generateApiSearchParams } from "@/lib/search-params"

type Out<T extends z.ZodType> = z.output<T>

/** Blank optional inputs mean "not set", which the API expects as null. */
function blankToNull<T>(value: T): T {
  if (Array.isArray(value)) return value.map(blankToNull) as T
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        item === "" ? null : blankToNull(item),
      ])
    ) as T
  }
  return value
}

/* ------------------------------ Departments ------------------------------- */

export async function getDepartments() {
  // Departments are few; one page of 100 covers the pickers and the list.
  return apiClient.getPaginatedFn<Department[]>("/v1/departments?per_page=100")
}

export async function createDepartment(data: Out<typeof DepartmentCreateSchema>) {
  return apiClient.postFn<Department>("/v1/departments", blankToNull(data))
}

export async function updateDepartment({
  id,
  ...data
}: Out<typeof DepartmentUpdateSchema>) {
  return apiClient.patchFn<Department>(`/v1/departments/${id}`, blankToNull(data))
}

export async function deleteDepartment(id: EntityId) {
  return apiClient.deleteFn(`/v1/departments/${id}`)
}

/* --------------------------------- Staff ---------------------------------- */

export async function getStaffList(search: StaffSearch) {
  const params = generateApiSearchParams(search)
  return apiClient.getPaginatedFn<Staff[]>(`/v1/staff?${params}`)
}

export async function getStaff(id: EntityId) {
  return apiClient.getFn<Staff>(`/v1/staff/${id}`)
}

export async function createStaff(data: Out<typeof StaffCreateSchema>) {
  return apiClient.postFn<Staff>("/v1/staff", blankToNull(data))
}

export async function updateStaff({ id, ...data }: Out<typeof StaffUpdateSchema>) {
  return apiClient.patchFn<Staff>(`/v1/staff/${id}`, blankToNull(data))
}

export async function deleteStaff(id: EntityId) {
  return apiClient.deleteFn(`/v1/staff/${id}`)
}

export async function terminateStaff({
  id,
  ...data
}: Out<typeof StaffTerminateSchema>) {
  return apiClient.postFn<Staff>(`/v1/staff/${id}/terminate`, blankToNull(data))
}

export async function grantSystemAccess({
  id,
  ...data
}: Out<typeof SystemAccessGrantSchema>) {
  return apiClient.postFn<Staff>(`/v1/staff/${id}/system-access`, blankToNull(data))
}

export async function revokeSystemAccess(id: EntityId) {
  return apiClient.deleteFn<Staff>(`/v1/staff/${id}/system-access`)
}

export async function getStaffCompensation(id: EntityId) {
  return apiClient.getFn<StaffCompensation>(`/v1/staff/${id}/compensation`)
}

export async function setStaffCompensation({
  id,
  ...data
}: Out<typeof CompensationSetSchema>) {
  return apiClient.putFn<StaffCompensation>(`/v1/staff/${id}/compensation`, blankToNull(data))
}

export async function setStaffComponents({
  id,
  ...data
}: Out<typeof StaffComponentsSetSchema>) {
  return apiClient.putFn<StaffCompensation>(
    `/v1/staff/${id}/pay-components`,
    blankToNull(data)
  )
}

/* --------------------------------- Leave ---------------------------------- */

export async function getLeaveTypes() {
  return apiClient.getFn<LeaveType[]>("/v1/leave-types")
}

export async function createLeaveType(data: Out<typeof LeaveTypeCreateSchema>) {
  return apiClient.postFn<LeaveType>("/v1/leave-types", blankToNull(data))
}

export async function updateLeaveType({
  id,
  ...data
}: Out<typeof LeaveTypeUpdateSchema>) {
  return apiClient.patchFn<LeaveType>(`/v1/leave-types/${id}`, blankToNull(data))
}

export async function deleteLeaveType(id: EntityId) {
  return apiClient.deleteFn(`/v1/leave-types/${id}`)
}

export async function getPublicHolidays(year?: number) {
  return apiClient.getFn<PublicHoliday[]>(
    `/v1/public-holidays${year ? `?year=${year}` : ""}`
  )
}

export async function createPublicHoliday(
  data: Out<typeof PublicHolidayCreateSchema>
) {
  return apiClient.postFn<PublicHoliday>("/v1/public-holidays", blankToNull(data))
}

export async function deletePublicHoliday(id: EntityId) {
  return apiClient.deleteFn(`/v1/public-holidays/${id}`)
}

export async function getLeaveBalances(staffId: EntityId, year?: number) {
  const params = generateApiSearchParams({ staff_id: staffId, year })
  return apiClient.getFn<LeaveBalance[]>(`/v1/leave-balances?${params}`)
}

export async function adjustLeaveBalance(
  data: Out<typeof LeaveBalanceAdjustSchema>
) {
  return apiClient.putFn<LeaveBalance[]>("/v1/leave-balances", blankToNull(data))
}

export async function getLeaveRequests(search: LeaveRequestSearch) {
  const params = generateApiSearchParams(search)
  return apiClient.getPaginatedFn<LeaveRequest[]>(`/v1/leave-requests?${params}`)
}

export async function createLeaveRequest(
  data: Out<typeof LeaveRequestCreateSchema>
) {
  return apiClient.postFn<LeaveRequest>("/v1/leave-requests", blankToNull(data))
}

export async function decideLeaveRequest(
  action: "approve" | "reject",
  { id, note }: Out<typeof LeaveDecisionSchema>
) {
  return apiClient.postFn<LeaveRequest>(`/v1/leave-requests/${id}/${action}`, {
    note,
  })
}

export async function cancelLeaveRequest(id: EntityId) {
  return apiClient.postFn<LeaveRequest>(`/v1/leave-requests/${id}/cancel`, {})
}

/* -------------------------------- Payroll --------------------------------- */

export async function getPayComponents() {
  return apiClient.getFn<PayComponent[]>("/v1/pay-components")
}

export async function createPayComponent(
  data: Out<typeof PayComponentCreateSchema>
) {
  return apiClient.postFn<PayComponent>("/v1/pay-components", blankToNull(data))
}

export async function updatePayComponent({
  id,
  ...data
}: Out<typeof PayComponentUpdateSchema>) {
  return apiClient.patchFn<PayComponent>(`/v1/pay-components/${id}`, blankToNull(data))
}

export async function deletePayComponent(id: EntityId) {
  return apiClient.deleteFn(`/v1/pay-components/${id}`)
}

export async function getTaxBands() {
  return apiClient.getFn<TaxBand[]>("/v1/tax-bands")
}

export async function replaceTaxBands(data: Out<typeof TaxBandsReplaceSchema>) {
  return apiClient.putFn<TaxBand[]>("/v1/tax-bands", blankToNull(data))
}

export async function getPayrollRuns(search: PayrollRunSearch) {
  const params = generateApiSearchParams(search)
  return apiClient.getPaginatedFn<PayrollRun[]>(`/v1/payroll-runs?${params}`)
}

export async function getPayrollRun(id: EntityId) {
  return apiClient.getFn<PayrollRunDetail>(`/v1/payroll-runs/${id}`)
}

export async function createPayrollRun(data: Out<typeof PayrollRunCreateSchema>) {
  return apiClient.postFn<PayrollRunDetail>("/v1/payroll-runs", blankToNull(data))
}

export async function generatePayrollRun(id: EntityId) {
  return apiClient.postFn<PayrollGenerateResult>(
    `/v1/payroll-runs/${id}/generate`,
    {}
  )
}

export async function approvePayrollRun(id: EntityId) {
  return apiClient.postFn<PayrollRunDetail>(`/v1/payroll-runs/${id}/approve`, {})
}

export async function payPayrollRun({
  id,
  paid_on,
}: Out<typeof PayrollRunPaySchema>) {
  return apiClient.postFn<PayrollRunDetail>(`/v1/payroll-runs/${id}/pay`, {
    paid_on,
  })
}

export async function cancelPayrollRun(id: EntityId) {
  return apiClient.postFn<PayrollRunDetail>(`/v1/payroll-runs/${id}/cancel`, {})
}

export async function getPayslip(id: EntityId) {
  return apiClient.getFn<Payslip>(`/v1/payslips/${id}`)
}

export async function addPayslipLine({
  run_id,
  payslip_id,
  ...data
}: Out<typeof PayslipLineCreateSchema>) {
  return apiClient.postFn<Payslip>(
    `/v1/payroll-runs/${run_id}/payslips/${payslip_id}/lines`,
    blankToNull(data)
  )
}

export async function removePayslipLine({
  run_id,
  payslip_id,
  line_id,
}: Out<typeof PayslipLineRemoveSchema>) {
  return apiClient.deleteFn<Payslip>(
    `/v1/payroll-runs/${run_id}/payslips/${payslip_id}/lines/${line_id}`
  )
}

/* ------------------------------ Self-service ------------------------------ */

export async function getMyStaffRecord() {
  return apiClient.getFn<Staff>("/v1/me/staff")
}

export async function getMyLeaveTypes() {
  return apiClient.getFn<LeaveType[]>("/v1/me/leave/types")
}

export async function getMyLeaveBalances(year?: number) {
  return apiClient.getFn<LeaveBalance[]>(
    `/v1/me/leave/balances${year ? `?year=${year}` : ""}`
  )
}

export async function getMyLeaveRequests() {
  return apiClient.getPaginatedFn<LeaveRequest[]>(
    "/v1/me/leave/requests?per_page=100"
  )
}

export async function requestMyLeave(data: Out<typeof MyLeaveRequestSchema>) {
  return apiClient.postFn<LeaveRequest>("/v1/me/leave/requests", blankToNull(data))
}

export async function cancelMyLeave(id: EntityId) {
  return apiClient.postFn<LeaveRequest>(`/v1/me/leave/requests/${id}/cancel`, {})
}

export async function getMyPayslips() {
  return apiClient.getFn<MyPayslip[]>("/v1/me/payslips")
}
