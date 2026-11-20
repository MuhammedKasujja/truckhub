import { useEffect, useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Plus, Wallet } from "lucide-react"
import { payrollRunsQueryOptions } from "../query-options"
import { PayrollRunCreateSchema } from "../schemas"
import { createPayrollRunFn } from "../services"
import { useHrAction } from "../use-hr-action"
import { MONTH_OPTIONS, RUN_STATUS_LABELS, formatPeriod } from "../labels"
import {
  FilterSelect,
  ListSkeleton,
  LoadError,
  Pager,
  RunStatusPill,
  TableCard,
} from "./hr-ui"
import type z from "zod"
import type { PayrollRunSearch } from "../schemas"
import type { PayrollRunStatus } from "../types"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import { NumberField, TextareaField } from "@/components/ui/form-fields"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { formatMoney } from "@/lib/format"

const STATUS_OPTIONS = (
  Object.entries(RUN_STATUS_LABELS) as [PayrollRunStatus, string][]
).map(([value, label]) => ({ value, label }))

export function PayrollRuns() {
  const search = useSearch({ from: "/_admin/hr/payroll/" })
  const navigate = useNavigate({ from: "/hr/payroll/" })
  const { data, isLoading, error } = useQuery(payrollRunsQueryOptions(search))
  const [createOpen, setCreateOpen] = useState(false)

  const setSearch = (updates: Partial<PayrollRunSearch>) =>
    navigate({ search: (prev) => ({ ...prev, page: 1, ...updates }), replace: true })

  const runs = data?.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          label="Status"
          allLabel="Any status"
          value={search.status}
          onChange={(status) => setSearch({ status })}
          options={STATUS_OPTIONS}
        />
        <Can permission="hr:payroll:manage">
          <Button className="ml-auto" onClick={() => setCreateOpen(true)}>
            <Plus />
            New payroll run
          </Button>
        </Can>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <LoadError message={error.message} />
      ) : runs.length === 0 ? (
        <SectionEmpty
          icon={Wallet}
          title="No payroll runs"
          description="Start a run for a month, generate the payslips, then approve and pay it."
          className="bg-card py-14"
        />
      ) : (
        <>
          <TableCard>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net pay</TableHead>
                  <TableHead className="text-right">Employer cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>
                      <Link
                        to="/hr/payroll/$runId"
                        params={{ runId: run.id }}
                        className="font-medium hover:underline"
                      >
                        {formatPeriod(run.period_year, run.period_month)}
                      </Link>
                      <p className="font-mono text-xs text-muted-foreground">
                        {run.number}
                      </p>
                    </TableCell>
                    <TableCell>
                      <RunStatusPill status={run.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(run.total_gross)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(run.total_deductions)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatMoney(run.total_net)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(run.total_employer_contributions)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
          <Pager
            pagination={data?.pagination}
            onPageChange={(page) => setSearch({ page })}
          />
        </>
      )}

      <CreateRunDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

function CreateRunDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  type Values = z.infer<typeof PayrollRunCreateSchema>
  const navigate = useNavigate()
  const now = new Date()
  const initial = (): Values => ({
    period_year: now.getFullYear(),
    period_month: now.getMonth() + 1,
    notes: "",
  })
  const form = useForm<Values>({
    resolver: zodResolver(PayrollRunCreateSchema),
    defaultValues: initial(),
  })
  useEffect(() => {
    if (open) form.reset(initial())
  }, [open])

  const create = useHrAction(
    (data: Values) => createPayrollRunFn({ data }),
    {
      onDone: (run) => {
        onOpenChange(false)
        if (run) navigate({ to: "/hr/payroll/$runId", params: { runId: run.id } })
      },
    }
  )
  const month = form.watch("period_month")

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Wallet}
      eyebrow="Payroll"
      title="Start a payroll run"
      description="One run per month. It starts as a draft with no payslips; generate them on the next screen."
      size="sm"
      submitText="Start run"
      isSubmitting={create.isPending}
      onSubmit={form.handleSubmit((values) => create.run(values))}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="run-month" className="text-sm font-medium">
            Month
          </label>
          <Select
            value={String(month)}
            onValueChange={(value) => form.setValue("period_month", Number(value))}
          >
            <SelectTrigger id="run-month" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <NumberField label="Year" name="period_year" control={form.control} />
      </div>
      <TextareaField
        label="Notes"
        name="notes"
        control={form.control}
        required={false}
      />
    </SettingsFormDialog>
  )
}
