import { queryOptions } from "@tanstack/react-query"
import {
  getDepartmentsFn,
  getLeaveBalancesFn,
  getLeaveRequestsFn,
  getLeaveTypesFn,
  getMyLeaveBalancesFn,
  getMyLeaveRequestsFn,
  getMyLeaveTypesFn,
  getMyPayslipsFn,
  getMyStaffRecordFn,
  getPayComponentsFn,
  getPayrollRunFn,
  getPayrollRunsFn,
  getPayslipFn,
  getPositionsFn,
  getPublicHolidaysFn,
  getStaffCompensationFn,
  getStaffFn,
  getStaffListFn,
  getTaxBandsFn,
} from "./services"
import type {
  LeaveRequestSearch,
  PayrollRunSearch,
  StaffSearch,
} from "./schemas"

/**
 * Every HR query sits under ["hr"], so one invalidation after a change
 * refreshes whatever HR data is on screen (a leave approval moves balances,
 * a salary change moves a draft payslip, and so on).
 */
export const hrQueryKeys = {
  all: () => ["hr"] as const,
  departments: () => [...hrQueryKeys.all(), "departments"] as const,
  positions: () => [...hrQueryKeys.all(), "positions"] as const,
  staff: () => [...hrQueryKeys.all(), "staff"] as const,
  staffList: (search: StaffSearch) =>
    [...hrQueryKeys.staff(), "list", search] as const,
  staffDetail: (id: string) => [...hrQueryKeys.staff(), "detail", id] as const,
  staffCompensation: (id: string) =>
    [...hrQueryKeys.staff(), "compensation", id] as const,
  leaveTypes: () => [...hrQueryKeys.all(), "leave-types"] as const,
  holidays: (year?: number) =>
    [...hrQueryKeys.all(), "holidays", year ?? "all"] as const,
  leaveBalances: (staffId: string, year?: number) =>
    [...hrQueryKeys.all(), "leave-balances", staffId, year ?? "current"] as const,
  leaveRequests: (search: LeaveRequestSearch) =>
    [...hrQueryKeys.all(), "leave-requests", search] as const,
  payComponents: () => [...hrQueryKeys.all(), "pay-components"] as const,
  taxBands: () => [...hrQueryKeys.all(), "tax-bands"] as const,
  payrollRuns: (search: PayrollRunSearch) =>
    [...hrQueryKeys.all(), "payroll-runs", "list", search] as const,
  payrollRun: (id: string) =>
    [...hrQueryKeys.all(), "payroll-runs", "detail", id] as const,
  payslip: (id: string) => [...hrQueryKeys.all(), "payslips", id] as const,
  me: () => [...hrQueryKeys.all(), "me"] as const,
} as const

export const departmentsQueryOptions = () =>
  queryOptions({
    queryKey: hrQueryKeys.departments(),
    queryFn: () => getDepartmentsFn(),
  })

export const positionsQueryOptions = () =>
  queryOptions({
    queryKey: hrQueryKeys.positions(),
    queryFn: () => getPositionsFn(),
  })

/** Active staff in the Mechanic position, for assigning them to maintenance. */
export const MECHANICS_SEARCH: StaffSearch = {
  page: 1,
  perPage: 100,
  search: "",
  status: "active",
  position_code: "mechanic",
}

export const staffListQueryOptions = (search: StaffSearch) =>
  queryOptions({
    queryKey: hrQueryKeys.staffList(search),
    queryFn: () => getStaffListFn({ data: search }),
  })

export const staffQueryOptions = (id: string) =>
  queryOptions({
    queryKey: hrQueryKeys.staffDetail(id),
    queryFn: () => getStaffFn({ data: { id } }),
  })

export const staffCompensationQueryOptions = (id: string) =>
  queryOptions({
    queryKey: hrQueryKeys.staffCompensation(id),
    queryFn: () => getStaffCompensationFn({ data: { id } }),
  })

export const leaveTypesQueryOptions = () =>
  queryOptions({
    queryKey: hrQueryKeys.leaveTypes(),
    queryFn: () => getLeaveTypesFn(),
  })

export const holidaysQueryOptions = (year?: number) =>
  queryOptions({
    queryKey: hrQueryKeys.holidays(year),
    queryFn: () => getPublicHolidaysFn({ data: { year } }),
  })

export const leaveBalancesQueryOptions = (staffId: string, year?: number) =>
  queryOptions({
    queryKey: hrQueryKeys.leaveBalances(staffId, year),
    queryFn: () => getLeaveBalancesFn({ data: { staff_id: staffId, year } }),
  })

export const leaveRequestsQueryOptions = (search: LeaveRequestSearch) =>
  queryOptions({
    queryKey: hrQueryKeys.leaveRequests(search),
    queryFn: () => getLeaveRequestsFn({ data: search }),
  })

export const payComponentsQueryOptions = () =>
  queryOptions({
    queryKey: hrQueryKeys.payComponents(),
    queryFn: () => getPayComponentsFn(),
  })

export const taxBandsQueryOptions = () =>
  queryOptions({
    queryKey: hrQueryKeys.taxBands(),
    queryFn: () => getTaxBandsFn(),
  })

export const payrollRunsQueryOptions = (search: PayrollRunSearch) =>
  queryOptions({
    queryKey: hrQueryKeys.payrollRuns(search),
    queryFn: () => getPayrollRunsFn({ data: search }),
  })

export const payrollRunQueryOptions = (id: string) =>
  queryOptions({
    queryKey: hrQueryKeys.payrollRun(id),
    queryFn: () => getPayrollRunFn({ data: { id } }),
  })

export const payslipQueryOptions = (id: string) =>
  queryOptions({
    queryKey: hrQueryKeys.payslip(id),
    queryFn: () => getPayslipFn({ data: { id } }),
  })

export const myStaffRecordQueryOptions = () =>
  queryOptions({
    queryKey: [...hrQueryKeys.me(), "staff"],
    queryFn: () => getMyStaffRecordFn(),
  })

export const myLeaveTypesQueryOptions = () =>
  queryOptions({
    queryKey: [...hrQueryKeys.me(), "leave-types"],
    queryFn: () => getMyLeaveTypesFn(),
  })

export const myLeaveBalancesQueryOptions = (year?: number) =>
  queryOptions({
    queryKey: [...hrQueryKeys.me(), "leave-balances", year ?? "current"],
    queryFn: () => getMyLeaveBalancesFn({ data: { year } }),
  })

export const myLeaveRequestsQueryOptions = () =>
  queryOptions({
    queryKey: [...hrQueryKeys.me(), "leave-requests"],
    queryFn: () => getMyLeaveRequestsFn(),
  })

export const myPayslipsQueryOptions = () =>
  queryOptions({
    queryKey: [...hrQueryKeys.me(), "payslips"],
    queryFn: () => getMyPayslipsFn(),
  })
