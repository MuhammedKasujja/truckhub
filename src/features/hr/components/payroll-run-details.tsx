import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Calculator,
  Check,
  CircleDollarSign,
  Plus,
  ReceiptText,
  TriangleAlert,
  X,
} from "lucide-react"
import { payslipQueryOptions } from "../query-options"
import { PayrollRunPaySchema, PayslipLineCreateSchema } from "../schemas"
import {
  addPayslipLineFn,
  approvePayrollRunFn,
  cancelPayrollRunFn,
  generatePayrollRunFn,
  payPayrollRunFn,
  removePayslipLineFn,
} from "../services"
import { useHrAction } from "../use-hr-action"
import { formatPeriod } from "../labels"
import { LoadError, RunStatusPill, TableCard } from "./hr-ui"
import { PayslipBreakdown } from "./payslip-view"
import type z from "zod"
import type { PayrollRunDetail, PayslipSummary, SkippedStaff } from "../types"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Can } from "@/components/has-permission"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DatePickerField,
  MoneyField,
  SelectField,
  SwitchField,
  TextField,
} from "@/components/ui/form-fields"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  SectionEmpty,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { formatDate, formatMoney, formatPlural } from "@/lib/format"

const LINE_KINDS = [
  { value: "earning", label: "Earning (bonus, allowance)" },
  { value: "deduction", label: "Deduction (advance, fine)" },
]

function Total({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          strong
            ? "text-xl font-bold tracking-tight tabular-nums"
            : "text-lg font-semibold tabular-nums"
        }
      >
        {formatMoney(value)}
      </p>
    </div>
  )
}

export function PayrollRunDetails({ run }: { run: PayrollRunDetail }) {
  const { hasPermission } = usePermissions()
  const [skipped, setSkipped] = useState<SkippedStaff[]>([])
  const [openPayslip, setOpenPayslip] = useState<PayslipSummary>()
  const [confirm, setConfirm] = useState<"approve" | "cancel">()
  const [payOpen, setPayOpen] = useState(false)

  const generate = useHrAction(
    (id: string) => generatePayrollRunFn({ data: { id } }),
    { onDone: (result) => setSkipped(result?.skipped ?? []) }
  )
  const approve = useHrAction(
    (id: string) => approvePayrollRunFn({ data: { id } }),
    { onDone: () => setConfirm(undefined) }
  )
  const cancel = useHrAction(
    (id: string) => cancelPayrollRunFn({ data: { id } }),
    { onDone: () => setConfirm(undefined) }
  )

  const period = formatPeriod(run.period_year, run.period_month)
  const isDraft = run.status === "draft"
  const canManage = hasPermission("hr:payroll:manage")
  const canApprove = hasPermission("hr:payroll:approve")
  const hasPayslips = run.payslips.length > 0

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/hr/payroll"
        className="-mb-2 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All payroll runs
      </Link>

      <section className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5 shadow-xs">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight">{period} payroll</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <RunStatusPill status={run.status} />
            {run.number && <span className="font-mono">{run.number}</span>}
            <span>
              {formatPlural(run.payslips.length, {
                singular: "payslip",
                plural: "payslips",
              })}
            </span>
            {run.paid_on && <span>Paid on {formatDate(run.paid_on)}</span>}
          </div>
          {run.notes && <p className="text-sm text-muted-foreground">{run.notes}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isDraft && canManage && (
            <Button
              variant={hasPayslips ? "outline" : "default"}
              disabled={generate.isPending}
              onClick={() => generate.run(run.id)}
            >
              <Calculator />
              {generate.isPending
                ? "Working it out…"
                : hasPayslips
                  ? "Generate again"
                  : "Generate payslips"}
            </Button>
          )}
          {isDraft && canApprove && hasPayslips && (
            <Button onClick={() => setConfirm("approve")}>
              <Check />
              Approve
            </Button>
          )}
          {run.status === "approved" && canApprove && (
            <Button onClick={() => setPayOpen(true)}>
              <CircleDollarSign />
              Mark as paid
            </Button>
          )}
          {(isDraft || run.status === "approved") && canManage && (
            <Button variant="ghost" onClick={() => setConfirm("cancel")}>
              Cancel run
            </Button>
          )}
        </div>
      </section>

      {isDraft && (
        <p className="text-sm text-muted-foreground">
          This is a draft. Generating again picks up changes to salaries, pay
          components and approved unpaid leave; one-off lines you added are kept.
          Staff can't see their payslips until the run is approved.
        </p>
      )}

      {skipped.length > 0 && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">
              {formatPlural(skipped.length, {
                singular: "staff member was",
                plural: "staff members were",
              })}{" "}
              left out
            </p>
            <ul className="mt-1 space-y-0.5">
              {skipped.map((item) => (
                <li key={item.staff_id}>
                  <Link
                    to="/hr/staff/$staffId/view"
                    params={{ staffId: item.staff_id }}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                  : {item.reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Total label="Gross pay" value={run.total_gross} />
        <Total label="Deductions, including tax" value={run.total_deductions} />
        <Total label="Net pay to staff" value={run.total_net} strong />
        <Total label="Employer contributions" value={run.total_employer_contributions} />
      </div>

      {!hasPayslips ? (
        <SectionEmpty
          icon={ReceiptText}
          title="No payslips yet"
          description={
            isDraft
              ? "Generate the payslips to work out everyone's pay for the month."
              : "This run has no payslips."
          }
          className="bg-card py-14"
        />
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff member</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Basic</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {run.payslips.map((payslip) => (
                <TableRow key={payslip.id}>
                  <TableCell>
                    <button
                      type="button"
                      className="text-left font-medium hover:underline"
                      onClick={() => setOpenPayslip(payslip)}
                    >
                      {payslip.staff_name}
                    </button>
                    <p className="font-mono text-xs text-muted-foreground">
                      {payslip.staff_number}
                    </p>
                  </TableCell>
                  <TableCell>{payslip.department_name ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(payslip.basic_salary)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(payslip.gross_pay)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(payslip.tax)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(payslip.total_deductions)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatMoney(payslip.net_pay)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}

      <PayslipDialog
        run={run}
        summary={openPayslip}
        onClose={() => setOpenPayslip(undefined)}
        editable={isDraft && canManage}
      />
      <PayRunDialog run={run} open={payOpen} onOpenChange={setPayOpen} />
      <ConfirmDialog
        open={confirm === "approve"}
        onOpenChange={(open) => !open && setConfirm(undefined)}
        isLoading={approve.isPending}
        title={`Approve the ${period} payroll?`}
        description={`Net pay of ${formatMoney(run.total_net)} to ${formatPlural(
          run.payslips.length,
          { singular: "staff member", plural: "staff members" }
        )}. Once approved the payslips can't be changed, and staff can see theirs.`}
        confirmLabel="Approve payroll"
        onConfirm={() => approve.run(run.id)}
      />
      <ConfirmDialog
        open={confirm === "cancel"}
        onOpenChange={(open) => !open && setConfirm(undefined)}
        isLoading={cancel.isPending}
        title={`Cancel the ${period} run?`}
        description="The run is kept for the record but no longer counts, and a new run can be started for the month."
        confirmLabel="Cancel run"
        onConfirm={() => cancel.run(run.id)}
      />
    </div>
  )
}

function PayRunDialog({
  run,
  open,
  onOpenChange,
}: {
  run: PayrollRunDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  type Values = z.infer<typeof PayrollRunPaySchema>
  const initial = (): Values => ({
    id: run.id,
    paid_on: new Date().toLocaleDateString("en-CA"),
  })
  const form = useForm<Values>({
    resolver: zodResolver(PayrollRunPaySchema),
    defaultValues: initial(),
  })
  useEffect(() => {
    if (open) form.reset(initial())
  }, [open])

  const pay = useHrAction(
    (data: Values) => payPayrollRunFn({ data }),
    { onDone: () => onOpenChange(false) }
  )

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={CircleDollarSign}
      eyebrow="Payroll"
      title="Mark this run as paid"
      description={`This records that ${formatMoney(run.total_net)} has been paid out. It doesn't move any money.`}
      size="sm"
      submitText="Mark as paid"
      isSubmitting={pay.isPending}
      onSubmit={form.handleSubmit((values) => pay.run(values))}
    >
      <DatePickerField
        label="Paid on"
        name="paid_on"
        control={form.control}
        startDate={new Date(run.period_year, run.period_month - 1, 1)}
      />
    </SettingsFormDialog>
  )
}

function PayslipDialog({
  run,
  summary,
  onClose,
  editable,
}: {
  run: PayrollRunDetail
  summary: PayslipSummary | undefined
  onClose: () => void
  editable: boolean
}) {
  const { data: payslip, isLoading, error } = useQuery({
    ...payslipQueryOptions(summary?.id ?? ""),
    enabled: !!summary,
  })
  const [addOpen, setAddOpen] = useState(false)

  const removeLine = useHrAction(
    (line_id: string) =>
      removePayslipLineFn({
        data: { run_id: run.id, payslip_id: summary!.id, line_id },
      })
  )

  return (
    <>
      <Dialog open={!!summary} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="shrink-0 border-b px-5 py-4 pr-12 text-left">
            <DialogTitle className="text-base font-bold tracking-tight">
              {summary?.staff_name}
            </DialogTitle>
            <DialogDescription>
              Payslip for {formatPeriod(run.period_year, run.period_month)}
              {payslip?.job_title ? ` · ${payslip.job_title}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {isLoading ? (
              <div className="h-48 animate-pulse rounded-lg bg-muted" />
            ) : error || !payslip ? (
              <LoadError message={error?.message} />
            ) : (
              <PayslipBreakdown
                payslip={payslip}
                lineAction={
                  editable
                    ? (line) =>
                        line.is_manual ? (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Remove ${line.name}`}
                            disabled={removeLine.isPending}
                            onClick={() => removeLine.run(line.id)}
                          >
                            <X />
                          </Button>
                        ) : (
                          // keeps amounts aligned with the removable lines
                          <span className="size-6 shrink-0" aria-hidden />
                        )
                    : undefined
                }
              />
            )}
          </div>
          {editable && (
            <div className="flex shrink-0 items-center justify-between gap-3 border-t px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Add a bonus or a one-off deduction for this month only.
              </p>
              <Can permission="hr:payroll:manage">
                <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
                  <Plus />
                  Add a line
                </Button>
              </Can>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {summary && (
        <AddLineDialog
          runId={run.id}
          payslipId={summary.id}
          staffName={summary.staff_name}
          open={addOpen}
          onOpenChange={setAddOpen}
        />
      )}
    </>
  )
}

function AddLineDialog({
  runId,
  payslipId,
  staffName,
  open,
  onOpenChange,
}: {
  runId: string
  payslipId: string
  staffName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  type Values = z.infer<typeof PayslipLineCreateSchema>
  const initial = (): Values => ({
    run_id: runId,
    payslip_id: payslipId,
    name: "",
    kind: "earning",
    amount: "",
    is_taxable: true,
  })
  const form = useForm<Values>({
    resolver: zodResolver(PayslipLineCreateSchema),
    defaultValues: initial(),
  })
  useEffect(() => {
    if (open) form.reset(initial())
  }, [open, payslipId])

  const add = useHrAction(
    (data: Values) => addPayslipLineFn({ data }),
    { onDone: () => onOpenChange(false) }
  )
  const kind = form.watch("kind")

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Plus}
      eyebrow="One-off line"
      title={`Add to ${staffName}'s payslip`}
      description="Applies to this payslip only. Tax and net pay are worked out again."
      size="sm"
      submitText="Add line"
      isSubmitting={add.isPending}
      onSubmit={form.handleSubmit((values) => add.run(values))}
    >
      <SelectField label="Type" name="kind" control={form.control} options={LINE_KINDS} />
      <TextField
        label="Description"
        name="name"
        control={form.control}
        placeholder={kind === "earning" ? "e.g. Performance bonus" : "e.g. Salary advance"}
      />
      <MoneyField label="Amount" name="amount" control={form.control} />
      {kind === "earning" && (
        <SwitchField
          label="Taxable"
          name="is_taxable"
          control={form.control}
          description="Counted in the pay that tax is worked out on"
        />
      )}
    </SettingsFormDialog>
  )
}
