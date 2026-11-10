import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/** Fills the space under the page header; the PDF scrolls inside it. */
export const PDF_FRAME_HEIGHT = "h-[calc(100dvh-13rem)] min-h-120"

/**
 * The outer card of the viewer: a toolbar row on top and a muted canvas under
 * it. Shared by the real viewer and its loading state so nothing jumps when
 * the PDF chunk arrives.
 */
export function PdfFrame({
  toolbar,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  toolbar: ReactNode
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card outline-none",
        PDF_FRAME_HEIGHT,
        className
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-card px-3 py-2">
        {toolbar}
      </div>
      <div className="pdf-canvas relative min-h-0 flex-1 bg-muted">
        {children}
      </div>
    </div>
  )
}

/** A blank sheet of paper with text placeholders. */
export function PdfPaperSkeleton() {
  return (
    <div className="flex h-full justify-center overflow-hidden p-6">
      <div className="aspect-[1/1.414] w-full max-w-3xl space-y-6 rounded-xs bg-background p-10 shadow-md">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-4 w-1/3" />
        <div className="space-y-2">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
        <Skeleton className="ml-auto h-8 w-1/3" />
      </div>
    </div>
  )
}

/** Placeholder toolbar shown before the viewer code has loaded. */
export function PdfToolbarSkeleton({ start }: { start?: ReactNode }) {
  return (
    <>
      {start}
      <Skeleton className="h-7 w-24" />
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-7 w-28" />
      </div>
    </>
  )
}
