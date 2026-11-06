import { Link } from "@tanstack/react-router"
import type { LinkProps } from "@tanstack/react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { WidgetEmpty } from "@/features/dashboard/components/widget-empty"
import { cn } from "@/lib/utils"

export type BreakdownItem = {
  key: string
  label: string
  /** Drives the bar length */
  value: number
  /** Right-hand text; defaults to `value` */
  display?: React.ReactNode
  /** Secondary text under the display value, e.g. a count next to an amount */
  hint?: React.ReactNode
  color?: string
  to?: LinkProps["to"]
  search?: LinkProps["search"]
}

type ReportBreakdownProps = {
  title: string
  description?: React.ReactNode
  items: BreakdownItem[]
  emptyText?: string
  className?: string
}

/** Horizontal bar list. Bars are relative to the largest item. */
export function ReportBreakdown({
  title,
  description,
  items,
  emptyText = "Nothing to show for this period",
  className,
}: ReportBreakdownProps) {
  const total = items.reduce((s, i) => s + Number(i.value), 0)
  const max = Math.max(1, ...items.map((i) => Number(i.value)))

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {total ? (
          <ul className="flex flex-col gap-3">
            {items.map((item) => {
              const share = total ? (Number(item.value) / total) * 100 : 0
              const row = (
                <>
                  <span className="truncate text-muted-foreground group-hover:text-foreground">
                    {item.label}
                  </span>
                  <span
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    title={`${share.toFixed(1)}%`}
                  >
                    <span
                      className="block h-full rounded-full transition-[width]"
                      style={{
                        width: `${(Number(item.value) / max) * 100}%`,
                        backgroundColor: item.color ?? "var(--primary)",
                      }}
                    />
                  </span>
                  <span className="flex flex-col items-end leading-tight">
                    <span className="font-medium tabular-nums">
                      {item.display ?? item.value}
                    </span>
                    {item.hint && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {item.hint}
                      </span>
                    )}
                  </span>
                </>
              )
              const rowClass =
                "group grid grid-cols-[minmax(6rem,9rem)_1fr_auto] items-center gap-3 text-sm"

              return (
                <li key={item.key}>
                  {item.to ? (
                    <Link
                      to={item.to}
                      search={item.search}
                      className={rowClass}
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className={rowClass}>{row}</div>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <WidgetEmpty>{emptyText}</WidgetEmpty>
        )}
      </CardContent>
    </Card>
  )
}
