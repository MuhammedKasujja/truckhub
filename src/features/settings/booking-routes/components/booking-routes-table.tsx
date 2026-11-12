import { useMemo, useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { IconRouteSquare } from "@tabler/icons-react"
import { bookingRoutesQueryOptions } from "../query-options"
import { deleteRouteFn } from "../services"
import { getBookingRoutesColumns } from "./booking-route-table-columns"
import { RouteEditForm } from "./route-edit-form"
import type {SortingState} from "@tanstack/react-table";
import type { BookingRouteActions } from "./booking-route-table-columns"
import type { BookingRoute } from "../schemas"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
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
  SettingsPage,
  SettingsPageHeader,
} from "@/features/settings/_components/settings-ui"
import {
  ConfigToolbar,
  ConfirmDeleteDialog,
} from "@/features/settings/vehicle-config/_components/config-ui"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { formatPlural } from "@/lib/format"
import { cn } from "@/lib/utils"

type Dialog = { kind: "form" | "delete"; route?: BookingRoute }

const ROUTE_WORDS = { singular: "route", plural: "routes" }

const describe = (route?: BookingRoute) =>
  route ? `${route.origin} → ${route.destination}` : "route"

function RoutesHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <SettingsPageHeader
      icon={IconRouteSquare}
      title="Booking routes"
      description="The trips company offers, with their distance and how long delivery takes."
      actions={actions}
    />
  )
}

export function BookingRoutesTable() {
  const {
    data: { data: routes, error },
  } = useSuspenseQuery(bookingRoutesQueryOptions())
  useFetchEror(error)

  const queryInvalidator = useQueryInvalidator()
  const [search, setSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([
    { id: "route", desc: false },
  ])
  const [dialog, setDialog] = useState<Dialog>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const open = (next: Dialog) => {
    setDialog(next)
    setDialogOpen(true)
  }

  const columns = useMemo(() => {
    const actions: BookingRouteActions = {
      onEdit: (route) => open({ kind: "form", route }),
      onDelete: (route) => open({ kind: "delete", route }),
    }
    return getBookingRoutesColumns(actions)
  }, [])

  // Routes come back in one list, so search, sort and paging run here.
  const table = useReactTable({
    data: routes,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    globalFilterFn: (row, _columnId, value: string) => {
      const query = value.trim().toLowerCase()
      const { origin, destination } = row.original
      return (
        origin.toLowerCase().includes(query) ||
        destination.toLowerCase().includes(query)
      )
    },
    getRowId: (route) => route.id.toString(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  })

  const query = search.trim()
  const matches = table.getFilteredRowModel().rows.length
  const origins = new Set(routes.map((r) => r.origin.trim().toLowerCase()))
  const deleting = dialog?.kind === "delete" ? dialog.route : undefined

  const addButton = (
    <Can permission="config:routes:create">
      <Button onClick={() => open({ kind: "form" })}>
        <Plus />
        Add route
      </Button>
    </Can>
  )

  return (
    <SettingsPage>
      <RoutesHeader actions={addButton} />

      <div className="flex flex-col gap-4">
        <ConfigToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            table.setPageIndex(0)
          }}
          placeholder="Search origin or destination"
        />

        <p className="text-xs text-muted-foreground">
          {query
            ? `${matches} of ${formatPlural(routes.length, ROUTE_WORDS)}`
            : `${formatPlural(routes.length, ROUTE_WORDS)} · ${formatPlural(origins.size, { singular: "origin", plural: "origins" })}`}
        </p>

        {matches === 0 ? (
          <SectionEmpty
            icon={IconRouteSquare}
            title={query ? "No routes match" : "No routes yet"}
            description={
              query
                ? "Try a different origin or destination."
                : "Add the trips you offer so they can be booked and priced."
            }
            action={query ? undefined : addButton}
            className="bg-card py-14"
          />
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id} className="hover:bg-transparent">
                    {group.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "px-4",
                          header.column.id === "route" && "min-w-56",
                          header.column.id === "distance_km" &&
                            "w-36 text-right",
                          header.column.id === "delivery" && "w-48",
                          header.column.id === "actions" && "w-14"
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="[&>td]:px-4 [&>td]:py-3">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="border-t bg-muted/30 px-3 py-2">
              <DataTablePagination table={table} />
            </div>
          </div>
        )}
      </div>

      <RouteEditForm
        key={dialog?.route?.id ?? "new"}
        initialData={dialog?.kind === "form" ? dialog.route : undefined}
        open={dialogOpen && dialog?.kind === "form"}
        onOpenChange={setDialogOpen}
      />
      <ConfirmDeleteDialog
        open={dialogOpen && dialog?.kind === "delete"}
        onOpenChange={setDialogOpen}
        title={`Delete ${describe(deleting)}?`}
        description="The route will no longer be offered for new bookings, and this can't be undone. Route pricing that uses it may be affected."
        onDelete={() => deleteRouteFn({ data: { id: deleting!.id } })}
        onDeleted={() => queryInvalidator.settings.routes.list()}
      />
    </SettingsPage>
  )
}

export function BookingRoutesTableSkeleton() {
  return (
    <SettingsPage aria-busy="true">
      <RoutesHeader />
      <div className="flex flex-col gap-4">
        <div className="h-9 w-72 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-56 animate-pulse rounded bg-muted" />
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="h-10 border-b bg-muted/40" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-6 border-b px-4 py-4 last:border-b-0"
            >
              <div className="h-8 flex-1 animate-pulse rounded bg-muted/70" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted/70" />
              <div className="h-8 w-32 animate-pulse rounded bg-muted/70" />
              <div className="size-7 animate-pulse rounded bg-muted/70" />
            </div>
          ))}
        </div>
      </div>
    </SettingsPage>
  )
}
