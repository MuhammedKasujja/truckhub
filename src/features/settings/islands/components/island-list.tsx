import { useMemo, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { IconSandbox } from "@tabler/icons-react"
import { islandsQueryOptions } from "../query-options"
import { deleteIslandByIdFn } from "../services"
import { IslandForm } from "./island-form"
import { LocationChips, LocationRows, includesText } from "./island-locations"
import type { Island } from "../types"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import { ViewToggle, type ListView } from "@/components/view-toggle"
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
  ConfigCardMenu,
  ConfigGridSkeleton,
  ConfigToolbar,
  ConfirmDeleteDialog,
} from "@/features/settings/vehicle-config/_components/config-ui"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { formatPlural } from "@/lib/format"

type Dialog = { kind: "form" | "delete"; island?: Island }

/** Edit and delete handlers for one island. */
type IslandActions = {
  onEdit: (island: Island) => void
  onDelete: (island: Island) => void
}

const ISLAND_WORDS = { singular: "island", plural: "islands" }
const LOCATION_WORDS = { singular: "location", plural: "locations" }

function IslandsHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <SettingsPageHeader
      icon={IconSandbox}
      title="Islands"
      description="The islands you serve and the locations on each."
      actions={actions}
    />
  )
}

export function IslandList() {
  const {
    data: { data: islands, error },
  } = useSuspenseQuery(islandsQueryOptions())
  useFetchEror(error)

  const { view = "cards" } = useSearch({ from: "/_admin/settings/islands/" })
  const navigate = useNavigate({ from: "/settings/islands/" })
  const setView = (next: ListView) =>
    navigate({
      // Cards is the default, so it stays out of the URL.
      search: (prev) => ({
        ...prev,
        view: next === "cards" ? undefined : next,
      }),
      replace: true,
    })

  const queryInvalidator = useQueryInvalidator()
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState<Dialog>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const open = (next: Dialog) => {
    setDialog(next)
    setDialogOpen(true)
  }

  const query = search.trim().toLowerCase()
  const visible = useMemo(
    () =>
      islands
        .filter(
          (island) =>
            !query ||
            includesText(island.name, query) ||
            island.locations.some((location) => includesText(location, query))
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [islands, query]
  )

  const locationCount = islands.reduce((sum, i) => sum + i.locations.length, 0)
  const deleting = dialog?.kind === "delete" ? dialog.island : undefined
  const actions: IslandActions = {
    onEdit: (island) => open({ kind: "form", island }),
    onDelete: (island) => open({ kind: "delete", island }),
  }

  const addButton = (
    <Can permission="config:routes:create">
      <Button onClick={() => open({ kind: "form" })}>
        <Plus />
        Add island
      </Button>
    </Can>
  )

  return (
    <SettingsPage>
      <IslandsHeader actions={addButton} />

      <div className="flex flex-col gap-4">
        <ConfigToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search islands and locations"
          action={<ViewToggle value={view} onChange={setView} />}
        />

        <p className="text-xs text-muted-foreground">
          {query
            ? `${visible.length} of ${formatPlural(islands.length, ISLAND_WORDS)}`
            : `${formatPlural(islands.length, ISLAND_WORDS)} · ${formatPlural(locationCount, LOCATION_WORDS)}`}
        </p>

        {visible.length === 0 ? (
          <SectionEmpty
            icon={IconSandbox}
            title={query ? "No islands match" : "No islands yet"}
            description={
              query
                ? "Try a different island or location name."
                : "Add an island and the locations on it."
            }
            action={query ? undefined : addButton}
            className="bg-card py-14"
          />
        ) : view === "table" ? (
          <IslandTable islands={visible} query={query} actions={actions} />
        ) : (
          <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((island) => (
              <IslandCard
                key={island.id}
                island={island}
                query={query}
                actions={actions}
              />
            ))}
          </div>
        )}
      </div>

      <IslandForm
        key={dialog?.island?.id ?? "new"}
        initialData={dialog?.kind === "form" ? dialog.island : undefined}
        open={dialogOpen && dialog?.kind === "form"}
        onOpenChange={setDialogOpen}
      />
      <ConfirmDeleteDialog
        open={dialogOpen && dialog?.kind === "delete"}
        onOpenChange={setDialogOpen}
        title={`Delete ${deleting?.name ?? "island"}?`}
        description={`This removes the island and ${formatPlural(deleting?.locations.length ?? 0, LOCATION_WORDS)}, and can't be undone. Island pricing that uses it may be affected.`}
        onDelete={() => deleteIslandByIdFn({ data: { id: deleting!.id } })}
        onDeleted={() => queryInvalidator.islands.list()}
      />
    </SettingsPage>
  )
}

function IslandMenu({
  island,
  actions,
}: {
  island: Island
  actions: IslandActions
}) {
  return (
    <ConfigCardMenu
      label={island.name}
      onEdit={() => actions.onEdit(island)}
      onDelete={() => actions.onDelete(island)}
      editPermission="config:routes:edit"
      deletePermission="config:routes:delete"
    />
  )
}

function IslandCard({
  island,
  query,
  actions,
}: {
  island: Island
  query: string
  actions: IslandActions
}) {
  return (
    <article className="flex flex-col rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{island.name}</h3>
          <p className="text-xs text-muted-foreground">
            {formatPlural(island.locations.length, LOCATION_WORDS)}
          </p>
        </div>
        <IslandMenu island={island} actions={actions} />
      </div>

      <div className="px-4 pb-4">
        <LocationChips locations={island.locations} query={query} />
      </div>
    </article>
  )
}

function IslandTable({
  islands,
  query,
  actions,
}: {
  islands: Island[]
  query: string
  actions: IslandActions
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table className="[&_td]:border-r [&_td]:px-3 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:px-3 [&_th:last-child]:border-r-0">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-48">Island</TableHead>
            <TableHead className="w-24 text-right">Count</TableHead>
            <TableHead className="min-w-64">Locations</TableHead>
            <TableHead className="w-14">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {islands.map((island) => (
            <TableRow
              key={island.id}
              className="even:bg-muted/40 [&>td]:py-3 [&>td]:align-top"
            >
              <TableCell className="font-medium">{island.name}</TableCell>
              <TableCell className="text-right text-muted-foreground tabular-nums">
                {island.locations.length}
              </TableCell>
              <TableCell className="whitespace-normal">
                <LocationRows locations={island.locations} query={query} />
              </TableCell>
              <TableCell className="text-center">
                <IslandMenu island={island} actions={actions} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function IslandListSkeleton() {
  return (
    <SettingsPage>
      <IslandsHeader />
      <ConfigGridSkeleton />
    </SettingsPage>
  )
}
