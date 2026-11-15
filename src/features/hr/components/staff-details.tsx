import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CalendarDays,
  Hash,
  IdCard,
  KeyRound,
  ListChecks,
  MailIcon,
  MoreHorizontal,
  PencilIcon,
  PhoneIcon,
  ShieldCheck,
  ShieldOff,
  UserIcon,
  Wallet,
} from "lucide-react"
import {
  leaveBalancesQueryOptions,
  staffCompensationQueryOptions,
} from "../query-options"
import {
  deleteStaffFn,
  revokeSystemAccessFn,
  updateStaffFn,
} from "../services"
import { useHrAction } from "../use-hr-action"
import {
  COMPONENT_KIND_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  GENDER_LABELS,
  PAYMENT_METHOD_LABELS,
  formatComponentValue,
  formatDays,
} from "../labels"
import { LoadError, StaffStatusPill, TableCard } from "./hr-ui"
import { toFormValues } from "./staff-form"
import {
  GrantAccessDialog,
  LeaveBalanceDialog,
  SalaryDialog,
  StaffComponentsDialog,
  TerminateStaffDialog,
} from "./staff-dialogs"
import type { LeaveBalance, Staff } from "../types"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Can } from "@/components/has-permission"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DetailItem,
  MissingValue,
  SectionEmpty,
  SettingsSection,
} from "@/features/settings/_components/settings-ui"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { formatDate, formatMoney } from "@/lib/format"

type DialogKind =
  | "terminate"
  | "delete"
  | "grant"
  | "revoke"
  | "salary"
  | "components"
  | "balance"

export function StaffDetails({ staff }: { staff: Staff }) {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [dialog, setDialog] = useState<DialogKind>()
  const [balance, setBalance] = useState<LeaveBalance>()
  const dialogProps = (kind: DialogKind) => ({
    staff,
    open: dialog === kind,
    onOpenChange: (open: boolean) => !open && setDialog(undefined),
  })

  const remove = useHrAction(
    (id: string) => deleteStaffFn({ data: { id } }),
    { onDone: () => navigate({ to: "/hr/staff" }) }
  )
  const revoke = useHrAction(
    (id: string) => revokeSystemAccessFn({ data: { id } }),
    { onDone: () => setDialog(undefined) }
  )
  const reinstate = useHrAction(() =>
    updateStaffFn({
      data: { ...toFormValues(staff), id: staff.id, status: "active" },
    })
  )

  const terminated = staff.status === "terminated"
  const canSeePay = hasPermission("hr:compensation:view")
  const canSeeLeave = hasPermission("hr:leave:view")

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/hr/staff"
        className="-mb-2 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All staff
      </Link>

      <section className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5 shadow-xs">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
          {staff.first_name.charAt(0)}
          {staff.last_name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div>
            <h2 className="truncate text-xl font-bold tracking-tight">{staff.name}</h2>
            <p className="truncate text-sm text-muted-foreground">
              {[staff.job_title, staff.department?.name].filter(Boolean).join(" · ") ||
                "No job title or department"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StaffStatusPill status={staff.status} />
            {staff.number && (
              <span className="font-mono text-xs text-muted-foreground">
                {staff.number}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Can permission="hr:staff:edit">
            {terminated ? (
              <Button
                variant="outline"
                disabled={reinstate.isPending}
                onClick={() => reinstate.run(undefined)}
              >
                Reinstate
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/hr/staff/$staffId/edit" params={{ staffId: staff.id }}>
                  <PencilIcon />
                  Edit
                </Link>
              </Button>
            )}
          </Can>
          {(hasPermission("hr:staff:terminate") || hasPermission("hr:staff:delete")) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`More actions for ${staff.name}`}
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {!terminated && (
                  <Can permission="hr:staff:terminate">
                    <DropdownMenuItem onSelect={() => setDialog("terminate")}>
                      End employment…
                    </DropdownMenuItem>
                  </Can>
                )}
                <Can permission="hr:staff:delete">
                  {!terminated && hasPermission("hr:staff:terminate") && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setDialog("delete")}
                  >
                    Delete record…
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </section>

      {terminated && (
        <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          Employment ended on{" "}
          <span className="font-medium">{formatDate(staff.termination_date)}</span>
          {staff.termination_reason && `: ${staff.termination_reason}`}
        </p>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SettingsSection icon={IdCard} title="Personal details">
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailItem icon={MailIcon} label="Email">
                {staff.email ? (
                  <a href={`mailto:${staff.email}`} className="hover:underline">
                    {staff.email}
                  </a>
                ) : (
                  <MissingValue />
                )}
              </DetailItem>
              <DetailItem icon={PhoneIcon} label="Phone">
                {staff.phone ? (
                  <a href={`tel:${staff.phone}`} className="hover:underline">
                    {staff.phone}
                  </a>
                ) : (
                  <MissingValue />
                )}
              </DetailItem>
              <DetailItem icon={UserIcon} label="Gender">
                {staff.gender ? GENDER_LABELS[staff.gender] : <MissingValue />}
              </DetailItem>
              <DetailItem icon={CalendarDays} label="Date of birth">
                {staff.date_of_birth ? formatDate(staff.date_of_birth) : <MissingValue />}
              </DetailItem>
              <DetailItem icon={Hash} label="National ID">
                {staff.national_id || <MissingValue />}
              </DetailItem>
              <DetailItem icon={Hash} label="TIN">
                {staff.tin || <MissingValue />}
              </DetailItem>
              <DetailItem icon={Hash} label="NSSF number">
                {staff.nssf_number || <MissingValue />}
              </DetailItem>
            </div>
          </SettingsSection>

          <SettingsSection icon={BriefcaseBusiness} title="Employment">
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailItem icon={Building2} label="Department">
                {staff.department?.name ?? <MissingValue />}
              </DetailItem>
              <DetailItem icon={BriefcaseBusiness} label="Job title">
                {staff.job_title || <MissingValue />}
              </DetailItem>
              <DetailItem icon={ListChecks} label="Employment type">
                {EMPLOYMENT_TYPE_LABELS[staff.employment_type]}
              </DetailItem>
              <DetailItem icon={CalendarDays} label="Hired">
                {formatDate(staff.hire_date)}
              </DetailItem>
            </div>
          </SettingsSection>

          <SettingsSection icon={Wallet} title="How they are paid">
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailItem icon={Wallet} label="Payment method">
                {PAYMENT_METHOD_LABELS[staff.payment_method]}
              </DetailItem>
              {staff.payment_method === "bank" && (
                <>
                  <DetailItem icon={Building2} label="Bank">
                    {staff.bank_name || <MissingValue />}
                  </DetailItem>
                  <DetailItem icon={UserIcon} label="Account name">
                    {staff.bank_account_name || <MissingValue />}
                  </DetailItem>
                  <DetailItem icon={Hash} label="Account number">
                    {staff.bank_account_number || <MissingValue />}
                  </DetailItem>
                </>
              )}
              {staff.payment_method === "mobile_money" && (
                <DetailItem icon={PhoneIcon} label="Mobile money number">
                  {staff.mobile_money_number || <MissingValue />}
                </DetailItem>
              )}
            </div>
          </SettingsSection>
        </div>

        <div className="flex flex-col gap-6">
          <SystemAccessSection
            staff={staff}
            onGrant={() => setDialog("grant")}
            onRevoke={() => setDialog("revoke")}
          />
          {canSeePay && (
            <CompensationSection
              staff={staff}
              onOpen={setDialog}
              dialogProps={dialogProps}
            />
          )}
          {canSeeLeave && (
            <LeaveBalancesSection
              staff={staff}
              onAdjust={(row) => {
                setBalance(row)
                setDialog("balance")
              }}
            />
          )}
        </div>
      </div>

      <TerminateStaffDialog {...dialogProps("terminate")} />
      <GrantAccessDialog {...dialogProps("grant")} />
      <LeaveBalanceDialog {...dialogProps("balance")} balance={balance} />
      <ConfirmDialog
        open={dialog === "revoke"}
        onOpenChange={(open) => !open && setDialog(undefined)}
        isLoading={revoke.isPending}
        title={`Revoke ${staff.name}'s access?`}
        description="They are signed out everywhere and can't sign in again until access is given back."
        confirmLabel="Revoke access"
        onConfirm={() => revoke.run(staff.id)}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(open) => !open && setDialog(undefined)}
        isLoading={remove.isPending}
        title={`Delete ${staff.name}'s record?`}
        description="Use this for records added by mistake. To record someone leaving, end their employment instead. Payslips already issued are kept."
        confirmLabel="Delete record"
        onConfirm={() => remove.run(staff.id)}
      />
    </div>
  )
}

function SystemAccessSection({
  staff,
  onGrant,
  onRevoke,
}: {
  staff: Staff
  onGrant: () => void
  onRevoke: () => void
}) {
  const canGrant = staff.status === "active"
  return (
    <SettingsSection
      icon={KeyRound}
      title="System access"
      description="Whether this person can sign in"
      action={
        <Can permission="hr:staff:access">
          {staff.has_system_access ? (
            <Button variant="outline" size="sm" onClick={onRevoke}>
              <ShieldOff />
              Revoke access
            </Button>
          ) : (
            <Button size="sm" onClick={onGrant} disabled={!canGrant}>
              <KeyRound />
              {staff.user_id ? "Switch back on" : "Give a login"}
            </Button>
          )}
        </Can>
      }
    >
      {staff.has_system_access ? (
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Can sign in</p>
            <p className="text-xs text-muted-foreground">
              Signs in with {staff.email ?? "their email"} and can see their own
              record, leave and payslips. Anything more comes from their roles.
            </p>
            {staff.user_id && (
              <Can permission="users:view">
                <Link
                  to="/settings/user-management/users/$userId/view"
                  params={{ userId: staff.user_id }}
                  className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                >
                  View login and roles
                </Link>
              </Can>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {staff.user_id
            ? "Access was revoked. Their login still exists and can be switched back on."
            : canGrant
              ? "This staff member has no login."
              : "Only active staff can be given a login."}
        </p>
      )}
    </SettingsSection>
  )
}

function CompensationSection({
  staff,
  onOpen,
  dialogProps,
}: {
  staff: Staff
  onOpen: (kind: DialogKind) => void
  dialogProps: (kind: DialogKind) => {
    staff: Staff
    open: boolean
    onOpenChange: (open: boolean) => void
  }
}) {
  const { data, isLoading, error } = useQuery(
    staffCompensationQueryOptions(staff.id)
  )

  return (
    <SettingsSection
      icon={Banknote}
      title="Pay"
      description="Basic salary and what is added or taken off each month"
      action={
        <Can permission="hr:compensation:edit">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpen("components")}>
              Components
            </Button>
            <Button size="sm" onClick={() => onOpen("salary")}>
              {data?.current ? "Change salary" : "Set salary"}
            </Button>
          </div>
        </Can>
      }
    >
      {isLoading ? (
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      ) : error || !data ? (
        <LoadError message={error?.message} />
      ) : (
        <div className="space-y-5">
          {data.current ? (
            <div>
              <p className="text-xs text-muted-foreground">Basic salary</p>
              <p className="text-2xl font-bold tracking-tight tabular-nums">
                {formatMoney(data.current.basic_salary)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  a month
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Since {formatDate(data.current.effective_from)}
              </p>
            </div>
          ) : (
            <SectionEmpty
              icon={Banknote}
              title="No salary set"
              description="Payroll skips staff who have no salary."
            />
          )}

          {data.components.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Their own components
              </p>
              <ul className="divide-y rounded-lg border text-sm">
                {data.components.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {row.component.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {COMPONENT_KIND_LABELS[row.component.kind]}
                        {!row.component.is_active && " · no longer used"}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatComponentValue(
                        row.component,
                        row.value ?? row.component.default_value
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.history.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Salary history
              </p>
              <ul className="space-y-1 text-sm">
                {data.history.map((row) => (
                  <li key={row.id} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {formatDate(row.effective_from)} –{" "}
                      {row.effective_to ? formatDate(row.effective_to) : "now"}
                    </span>
                    <span className="tabular-nums">{formatMoney(row.basic_salary)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <SalaryDialog {...dialogProps("salary")} current={data?.current ?? null} />
      <StaffComponentsDialog
        {...dialogProps("components")}
        assigned={data?.components ?? []}
      />
    </SettingsSection>
  )
}

function LeaveBalancesSection({
  staff,
  onAdjust,
}: {
  staff: Staff
  onAdjust: (balance: LeaveBalance) => void
}) {
  const year = new Date().getFullYear()
  const { data = [], isLoading, error } = useQuery(
    leaveBalancesQueryOptions(staff.id, year)
  )

  return (
    <SettingsSection
      icon={CalendarClock}
      title={`Leave in ${year}`}
      description="Days available for each type of paid leave"
    >
      {isLoading ? (
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      ) : error ? (
        <LoadError message={error.message} />
      ) : data.length === 0 ? (
        <SectionEmpty
          icon={CalendarClock}
          title="No paid leave types"
          description="Add leave types under HR setup."
        />
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Allowed</TableHead>
                <TableHead className="text-right">Taken</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.leave_type_id}>
                  <TableCell className="font-medium">{row.leave_type_name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(row.entitled) +
                      Number(row.carried_forward) +
                      Number(row.adjusted)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(row.taken)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(row.pending)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatDays(row.available)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Can permission="hr:leave:balances">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Adjust ${row.leave_type_name} balance`}
                        onClick={() => onAdjust(row)}
                      >
                        Adjust
                      </Button>
                    </Can>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}
    </SettingsSection>
  )
}
