import type { Payslip, PayslipLine } from "../types"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

function Lines({
  title,
  lines,
  total,
  totalLabel,
  action,
}: {
  title: string
  lines: PayslipLine[]
  total?: string
  totalLabel?: string
  action?: (line: PayslipLine) => React.ReactNode
}) {
  if (lines.length === 0) return null
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="divide-y rounded-lg border text-sm">
        {lines.map((line) => (
          <li key={line.id} className="flex items-center gap-3 px-3 py-2">
            <span className="min-w-0 flex-1 truncate">
              {line.name}
              {line.is_manual && (
                <span className="ml-1.5 text-xs text-muted-foreground">one-off</span>
              )}
            </span>
            <span
              className={cn(
                "shrink-0 tabular-nums",
                Number(line.amount) < 0 && "text-destructive"
              )}
            >
              {formatMoney(line.amount)}
            </span>
            {action?.(line)}
          </li>
        ))}
        {total !== undefined && (
          <li className="flex items-center justify-between gap-3 bg-muted/40 px-3 py-2 font-medium">
            <span>{totalLabel}</span>
            <span className="tabular-nums">{formatMoney(total)}</span>
          </li>
        )}
      </ul>
    </div>
  )
}

/** The body of a payslip: what was earned, what came off, and the net pay. */
export function PayslipBreakdown({
  payslip,
  lineAction,
}: {
  payslip: Payslip
  /** Extra control at the end of a line, e.g. remove for one-off lines. */
  lineAction?: (line: PayslipLine) => React.ReactNode
}) {
  const earnings = payslip.lines.filter(
    (l) => l.kind === "basic" || l.kind === "earning"
  )
  const deductions = payslip.lines.filter(
    (l) => l.kind === "tax" || l.kind === "deduction"
  )
  const employer = payslip.lines.filter((l) => l.kind === "employer_contribution")

  return (
    <div className="space-y-5">
      <Lines
        title="Earnings"
        lines={earnings}
        total={payslip.gross_pay}
        totalLabel="Gross pay"
        action={lineAction}
      />
      <Lines
        title="Deductions"
        lines={deductions}
        total={payslip.total_deductions}
        totalLabel="Total deductions"
        action={lineAction}
      />
      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <span className="text-sm font-medium">Net pay</span>
        <span className="text-xl font-bold tracking-tight tabular-nums">
          {formatMoney(payslip.net_pay)}
        </span>
      </div>
      <Lines
        title="Paid by the employer on top"
        lines={employer}
        total={payslip.employer_contributions}
        totalLabel="Employer contributions"
      />
      <p className="text-xs text-muted-foreground">
        Taxable pay {formatMoney(payslip.taxable_pay)}
        {payslip.payment_method === "bank" && payslip.bank_account_number
          ? ` · Paid to ${payslip.bank_name ?? "bank"} ${payslip.bank_account_number}`
          : payslip.payment_method === "mobile_money" && payslip.mobile_money_number
            ? ` · Paid to mobile money ${payslip.mobile_money_number}`
            : payslip.payment_method === "cash"
              ? " · Paid in cash"
              : ""}
      </p>
    </div>
  )
}
