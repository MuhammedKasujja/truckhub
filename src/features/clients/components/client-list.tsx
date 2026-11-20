import { useMemo } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { Building2Icon } from "lucide-react"
import { clientsQueryOptions } from "../query-options"
import { ClientCard, ClientCardSkeleton } from "./client-card"
import { getClientsTableColumns } from "./clients-table-columns"
import type { ClientType } from "@/config/constants"
import type { ListView } from "@/components/view-toggle"
import { DataTable } from "@/components/data-table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { ViewToggle } from "@/components/view-toggle"
import { useDataTable } from "@/hooks/use-data-table"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useTranslation } from "@/i18n"
import { formatPlural } from "@/lib/format"
import { cn } from "@/lib/utils"

const CLIENT_WORDS = { singular: "client", plural: "clients" }

const TYPE_FILTERS: { value: ClientType | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
]

/** Clients as a card grid or a table; both share search, filters, sort and paging. */
export function ClientList() {
  const search = useSearch({ from: "/_admin/clients/" })
  const {
    data: { data, pagination },
    error,
  } = useSuspenseQuery(clientsQueryOptions(search))
  useFetchEror(error)

  const tr = useTranslation()
  const columns = useMemo(() => getClientsTableColumns(tr), [tr])

  const navigate = useNavigate({ from: "/clients/" })
  const view: ListView = search.view ?? "cards"
  const setView = (next: ListView) =>
    navigate({
      // Cards is the default, so it stays out of the URL.
      search: (prev) => ({
        ...prev,
        view: next === "cards" ? undefined : next,
      }),
      replace: true,
    })
  const setClientType = (clientType: ClientType | undefined) =>
    navigate({
      search: (prev) => ({ ...prev, client_type: clientType, page: 1 }),
    })

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pagination.totalPages,
    initialState: {
      sorting: [{ id: "created_at", desc: true }],
    },
    getRowId: (row) => row.id.toString(),
    shallow: false,
    clearOnDefault: true,
  })

  const toolbar = (
    <DataTableToolbar table={table} showColumnFilter={view === "table"}>
      <ClientTypeFilter value={search.client_type} onChange={setClientType} />
      <DataTableSortList table={table} align="end" />
      <ViewToggle value={view} onChange={setView} />
    </DataTableToolbar>
  )

  if (view === "table") {
    return <DataTable table={table}>{toolbar}</DataTable>
  }

  const rows = table.getRowModel().rows
  const isFiltered = !!search.search || !!search.client_type

  return (
    <div className="flex w-full flex-col gap-2.5">
      {toolbar}
      <p className="px-1 text-xs text-muted-foreground">
        {formatPlural(pagination.total, CLIENT_WORDS)}
        {search.client_type && ` · ${search.client_type}`}
      </p>
      {rows.length === 0 ? (
        <Empty className="h-56 border border-dashed bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2Icon />
            </EmptyMedia>
            <EmptyTitle>
              {isFiltered ? "No clients match" : "No clients yet"}
            </EmptyTitle>
            <EmptyDescription>
              {isFiltered
                ? "Try a different name, email or phone number, or show all client types."
                : "Clients you add will show up here."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {rows.map((row) => (
            <ClientCard key={row.id} client={row.original} />
          ))}
        </div>
      )}
      <DataTablePagination table={table} />
    </div>
  )
}

/** All / Standard / Premium segmented filter, kept in the URL as client_type. */
function ClientTypeFilter({
  value,
  onChange,
}: {
  value: ClientType | undefined
  onChange: (value: ClientType | undefined) => void
}) {
  return (
    <div
      role="group"
      aria-label="Client type"
      className="inline-flex gap-0.5 rounded-lg border bg-background p-0.5"
    >
      {TYPE_FILTERS.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-7 items-center rounded-md px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
              active &&
                "bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function ClientListSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2.5" aria-busy="true">
      <div className="flex justify-between gap-2 p-1">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-8 w-72" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ClientCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
