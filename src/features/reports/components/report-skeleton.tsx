import { Skeleton } from "@/components/ui/skeleton"

export function ReportSkeleton() {
  return (
    <div
      className="flex flex-col gap-5"
      aria-busy="true"
      aria-label="Loading report"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Skeleton className="h-80 rounded-lg lg:col-span-8" />
        <Skeleton className="h-80 rounded-lg lg:col-span-4" />
      </div>
      <Skeleton className="h-72 rounded-lg" />
    </div>
  )
}
