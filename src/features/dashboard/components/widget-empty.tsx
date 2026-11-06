import { cn } from "@/lib/utils"

export function WidgetEmpty({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}
