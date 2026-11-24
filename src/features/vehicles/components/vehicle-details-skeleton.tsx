import { Skeleton, SkeletonCircle } from "@/components/ui/skeleton"

/** Loading placeholder that mirrors the layout of `VehicleDetails`. */
export function VehicleDetailsSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-6 pb-10"
      aria-busy
      aria-label="Loading vehicle details"
    >
      <Skeleton className="h-5 w-28" />

      <HeroSkeleton />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <SectionSkeleton>
            <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
              <SpecGroupSkeleton />
              <SpecGroupSkeleton />
            </div>
          </SectionSkeleton>

          <SectionSkeleton>
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Skeleton className="size-10 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </SectionSkeleton>

          <SectionSkeleton>
            <div className="flex flex-wrap gap-2">
              {[20, 28, 16, 24, 32, 20].map((w, i) => (
                <Skeleton
                  key={i}
                  className="h-7 rounded-full"
                  style={{ width: `${w * 4}px` }}
                />
              ))}
            </div>
          </SectionSkeleton>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <SectionSkeleton noDescription>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <SkeletonCircle className="size-12" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
            </div>
          </SectionSkeleton>

          <SectionSkeleton noDescription>
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <InfoRowSkeleton key={i} />
              ))}
            </div>
          </SectionSkeleton>
        </div>
      </div>
    </div>
  )
}

function HeroSkeleton() {
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          <Skeleton className="size-16 shrink-0 rounded-2xl" />
          <div className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-36" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-56 sm:h-9" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 shrink-0 self-start" />
      </div>

      <div className="-mr-px -mb-px grid grid-cols-2 border-t bg-muted/30 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 border-r border-b px-5 py-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </section>
  )
}

function SectionSkeleton({
  noDescription = false,
  children,
}: {
  noDescription?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <Skeleton className="size-8 shrink-0 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          {!noDescription && <Skeleton className="h-3 w-40" />}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function SpecGroupSkeleton() {
  return (
    <div className="min-w-0">
      <Skeleton className="mb-2 h-3 w-24" />
      <div className="divide-y divide-dashed">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

function InfoRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-28" />
    </div>
  )
}
