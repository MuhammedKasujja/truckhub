import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ListOrdered, TriangleAlert } from "lucide-react"
import { EntityNumbersEditor } from "@/features/settings/entity-numbers/components"
import { entityNumberPatternsQueryOptions } from "@/features/settings/entity-numbers/query-options"
import {
  SectionEmpty,
  SettingsPage,
  SettingsPageHeader,
} from "@/features/settings/_components/settings-ui"

export const Route = createFileRoute("/_admin/settings/generate-numbers/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(entityNumberPatternsQueryOptions())
  },
})

function RouteComponent() {
  const { data, isLoading, error } = useQuery(
    entityNumberPatternsQueryOptions()
  )
  const loadError = error ?? data?.error
  const hasPatterns = !!data && Object.keys(data.data.entities).length > 0

  return (
    <SettingsPage>
      <SettingsPageHeader
        icon={ListOrdered}
        title="Document numbers"
        description="The pattern used to number invoices, quotations, bookings and other records as they are created."
      />

      {isLoading ? (
        <EditorSkeleton />
      ) : loadError ? (
        <SectionEmpty
          icon={TriangleAlert}
          title="Couldn't load document numbers"
          description={loadError.message || "Refresh the page to try again."}
        />
      ) : !hasPatterns ? (
        <SectionEmpty
          icon={ListOrdered}
          title="No numbering patterns"
          description="No document types have a numbering pattern set up yet."
        />
      ) : (
        <EntityNumbersEditor patterns={data.data} />
      )}
    </SettingsPage>
  )
}

function EditorSkeleton() {
  return (
    <div
      aria-busy="true"
      className="flex flex-col gap-6 lg:flex-row lg:items-start"
    >
      <div className="space-y-1 rounded-xl border p-1.5 lg:w-72">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5 px-3 py-2">
            <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-36 animate-pulse rounded bg-muted/70" />
          </div>
        ))}
      </div>
      <div className="h-96 flex-1 animate-pulse rounded-xl bg-muted/60" />
    </div>
  )
}
