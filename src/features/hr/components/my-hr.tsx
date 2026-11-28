import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CircleUserRoundIcon,
  Hash,
  MailIcon,
  PhoneIcon,
  ReceiptText,
  UserRoundX,
} from "lucide-react"
import {
  myLeaveBalancesQueryOptions,
  myLeaveRequestsQueryOptions,
  myLeaveTypesQueryOptions,
  myPayslipsQueryOptions,
  myStaffRecordQueryOptions,
} from "../query-options"
import { MyLeaveRequestSchema } from "../schemas"
import { cancelMyLeaveFn, requestMyLeaveFn } from "../services"
import { useHrAction } from "../use-hr-action"
import { EMPLOYMENT_TYPE_LABELS, formatDays, formatPeriod } from "../labels"
import { LeaveStatusPill, LoadError, StaffStatusPill } from "./hr-ui"
import { LeaveFields, canCancelLeave, formatLeaveDates } from "./leave-requests"
import { PayslipBreakdown } from "./payslip-view"
import type z from "zod"
import type { LeaveBalance, LeaveRequest, MyPayslip, Staff } from "../types"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DetailItem,
  MissingValue,
  SectionEmpty,
  SettingsFormDialog,
  SettingsPage,
  SettingsPageHeader,
  SettingsSection,
} from "@/features/settings/_components/settings-ui"
import { formatDate, formatMoney } from "@/lib/format"

export function MyHr() {
  const { data: staff } = useSuspenseQuery(myStaffRecordQueryOptions())

  return (
    <SettingsPage>
      <SettingsPageHeader
        icon={CircleUserRoundIcon}
        title="My HR"
        description="Your staff record, leave and payslips."
      />
      {staff ? (
        <MyHrContent staff={staff} />
      ) : (
        <SectionEmpty
          icon={UserRoundX}
          title="Your login isn't linked to a staff record"
          description="Ask HR to link it. Until then there is no leave or payslip information to show."
          className="bg-card py-14"
        />
      )}
    </SettingsPage>
  )
}

function MyHrContent({ staff }: { staff: Staff }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="flex flex-col gap-6">
        <SettingsSection icon={BriefcaseBusiness} title={staff.name}>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <StaffStatusPill status={staff.status} />
            {staff.number && (
              <span className="font-mono text-xs text-muted-foreground">
                {staff.number}
              </span>
            )}
          </div>
          <div className="grid gap-5">
            <DetailItem icon={BriefcaseBusiness} label="Position">
              {staff.position?.name ?? <MissingValue />}
            </DetailItem>
            <DetailItem icon={Building2} label="Department">
              {staff.department?.name ?? <MissingValue />}
            </DetailItem>
            <DetailItem icon={Hash} label="Employment type">
              {EMPLOYMENT_TYPE_LABELS[staff.employment_type]}
            </DetailItem>
            <DetailItem icon={CalendarDays} label="Hired">
              {formatDate(staff.hire_date)}
            </DetailItem>
            <DetailItem icon={MailIcon} label="Email">
              {staff.email || <MissingValue />}
            </DetailItem>
            <DetailItem icon={PhoneIcon} label="Phone">
              {staff.phone || <MissingValue />}
            </DetailItem>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Something wrong? Ask HR to correct your record.
          </p>
        </SettingsSection>
        <MyPayslips />
      </div>
      <MyLeave staff={staff} />
    </div>
  )
}

/* --------------------------------- Leave ---------------------------------- */

function MyLeave({ staff }: { staff: Staff }) {
  const balances = useQuery(myLeaveBalancesQueryOptions())
  const requests = useQuery(myLeaveRequestsQueryOptions())
  const [requestOpen, setRequestOpen] = useState(false)
  const [cancelling, setCancelling] = useState<LeaveRequest>()

  const cancel = useHrAction(
    (id: string) => cancelMyLeaveFn({ data: { id } }),
    { onDone: () => setCancelling(undefined) }
  )

  return (
    <SettingsSection
      icon={CalendarClock}
      title="My leave"
      description={`Days available in ${new Date().getFullYear()} and your requests`}
      action={
        <Button
          size="sm"
          onClick={() => setRequestOpen(true)}
          disabled={staff.status !== "active"}
        >
          <CalendarPlus />
          Request leave
        </Button>
      }
    >
      <div className="space-y-6">
        {balances.isLoading ? (
          <div className="h-20 animate-pulse rounded-lg bg-muted" />
        ) : balances.error ? (
          <LoadError message={balances.error.message} />
        ) : (
          <BalanceTiles balances={balances.data ?? []} />
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Requests
          </p>
          {requests.isLoading ? (
            <div className="h-20 animate-pulse rounded-lg bg-muted" />
          ) : requests.error ? (
            <LoadError message={requests.error.message} />
          ) : (requests.data ?? []).length === 0 ? (
            <SectionEmpty
              icon={CalendarClock}
              title="You haven't requested any leave"
            />
          ) : (
            <ul className="divide-y rounded-lg border text-sm">
              {(requests.data ?? []).map((request) => (
                <li key={request.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {request.leave_type.name}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {formatDays(request.days)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatLeaveDates(request)}
                      {request.decision_note && ` · “${request.decision_note}”`}
                    </p>
                  </div>
                  <LeaveStatusPill status={request.status} />
                  {canCancelLeave(request) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCancelling(request)}
                    >
                      Cancel
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <RequestLeaveDialog open={requestOpen} onOpenChange={setRequestOpen} />
      <ConfirmDialog
        open={!!cancelling}
        onOpenChange={(open) => !open && setCancelling(undefined)}
        isLoading={cancel.isPending}
        title="Cancel this leave?"
        description={
          cancelling?.status === "approved"
            ? "The days go back to your balance."
            : "Your request is withdrawn."
        }
        confirmLabel="Cancel leave"
        onConfirm={() => cancelling && cancel.run(cancelling.id)}
      />
    </SettingsSection>
  )
}

function BalanceTiles({ balances }: { balances: LeaveBalance[] }) {
  if (balances.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No paid leave types have been set up yet.
      </p>
    )
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {balances.map((balance) => (
        <li key={balance.leave_type_id} className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">{balance.leave_type_name}</p>
          <p className="text-xl font-bold tracking-tight tabular-nums">
            {formatDays(balance.available)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              available
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {Number(balance.taken)} taken
            {Number(balance.pending) > 0 && ` · ${Number(balance.pending)} awaiting approval`}
          </p>
        </li>
      ))}
    </ul>
  )
}

function RequestLeaveDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  type Values = z.infer<typeof MyLeaveRequestSchema>
  const { data: types = [] } = useQuery({
    ...myLeaveTypesQueryOptions(),
    enabled: open,
  })

  const empty = { leave_type_id: "", start_date: "", end_date: "", reason: "" }
  const form = useForm<Values>({
    resolver: zodResolver(MyLeaveRequestSchema),
    defaultValues: empty,
  })
  useEffect(() => {
    if (open) form.reset(empty)
  }, [open])

  const request = useHrAction(
    (data: Values) => requestMyLeaveFn({ data }),
    { onDone: () => onOpenChange(false) }
  )

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={CalendarPlus}
      eyebrow="Leave"
      title="Request leave"
      description="Weekends and public holidays inside your dates aren't counted. Your request goes to HR for approval."
      submitText="Send request"
      isSubmitting={request.isPending}
      onSubmit={form.handleSubmit((values) => request.run(values))}
    >
      <LeaveFields control={form.control} types={types} />
    </SettingsFormDialog>
  )
}

/* -------------------------------- Payslips -------------------------------- */

function MyPayslips() {
  const { data = [], isLoading, error } = useQuery(myPayslipsQueryOptions())
  const [viewing, setViewing] = useState<MyPayslip>()

  return (
    <SettingsSection
      icon={ReceiptText}
      title="My payslips"
      description="Shown once a month's payroll has been approved"
    >
      {isLoading ? (
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      ) : error ? (
        <LoadError message={error.message} />
      ) : data.length === 0 ? (
        <SectionEmpty icon={ReceiptText} title="No payslips yet" />
      ) : (
        <ul className="divide-y rounded-lg border text-sm">
          {data.map((payslip) => (
            <li key={payslip.id}>
              <button
                type="button"
                onClick={() => setViewing(payslip)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span>
                  <span className="block font-medium">
                    {formatPeriod(payslip.period_year, payslip.period_month)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {payslip.paid_on
                      ? `Paid on ${formatDate(payslip.paid_on)}`
                      : "Approved, not yet paid"}
                  </span>
                </span>
                <span className="font-semibold tabular-nums">
                  {formatMoney(payslip.net_pay)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(undefined)}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="shrink-0 border-b px-5 py-4 pr-12 text-left">
            <DialogTitle className="text-base font-bold tracking-tight">
              {viewing && formatPeriod(viewing.period_year, viewing.period_month)} payslip
            </DialogTitle>
            <DialogDescription>
              {viewing?.staff_name}
              {viewing?.job_title ? ` · ${viewing.job_title}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {viewing && <PayslipBreakdown payslip={viewing} />}
          </div>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  )
}
