import { useEffect, useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { KeyRound, Plus, Users } from "lucide-react"
import {
  departmentsQueryOptions,
  positionsQueryOptions,
  staffListQueryOptions,
} from "../query-options"
import { STAFF_STATUS_OPTIONS } from "../labels"
import {
  FilterSelect,
  ListSkeleton,
  LoadError,
  Pager,
  StaffStatusPill,
  TableCard,
} from "./hr-ui"
import type { StaffSearch } from "../schemas"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SectionEmpty } from "@/features/settings/_components/settings-ui"
import { ConfigToolbar } from "@/features/settings/vehicle-config/_components/config-ui"
import { useDebounce } from "@/hooks/use-debounce"
import { formatDate, formatPlural } from "@/lib/format"

const ACCESS_OPTIONS = [
  { value: "yes", label: "Has a login" },
  { value: "no", label: "No login" },
] as const

export function StaffList() {
  const search = useSearch({ from: "/_admin/hr/staff/" })
  const navigate = useNavigate({ from: "/hr/staff/" })
  const { data, isLoading, error } = useQuery(staffListQueryOptions(search))
  const { data: departments = [] } = useQuery(departmentsQueryOptions())
  // Needs positions:read; without it the filter just has no choices
  const { data: positions = [] } = useQuery(positionsQueryOptions())

  const setSearch = (updates: Partial<StaffSearch>) =>
    navigate({
      search: (prev) => ({ ...prev, page: 1, ...updates }),
      replace: true,
    })

  // The query lives in the URL; type freely, then update it once typing stops.
  const [query, setQuery] = useState(search.search)
  const debouncedQuery = useDebounce(query, 350)
  useEffect(() => {
    if (debouncedQuery !== search.search) setSearch({ search: debouncedQuery })
  }, [debouncedQuery])

  const staff = data?.data ?? []
  const filtered =
    !!search.search ||
    !!search.status ||
    !!search.department_id ||
    !!search.position_id ||
    search.has_system_access !== undefined

  return (
    <div className="flex flex-col gap-4">
      <ConfigToolbar
        search={query}
        onSearchChange={setQuery}
        placeholder="Search by name, number, email or phone"
        filters={
          <>
            <FilterSelect
              label="Status"
              allLabel="Any status"
              value={search.status}
              onChange={(status) => setSearch({ status })}
              options={STAFF_STATUS_OPTIONS}
            />
            <FilterSelect
              label="Department"
              allLabel="All departments"
              value={search.department_id}
              onChange={(department_id) => setSearch({ department_id })}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
            <FilterSelect
              label="Position"
              allLabel="All positions"
              value={search.position_id}
              onChange={(position_id) => setSearch({ position_id })}
              options={positions.map((p) => ({ value: p.id, label: p.name }))}
            />
            <FilterSelect
              label="System access"
              allLabel="Login or not"
              value={
                search.has_system_access === undefined
                  ? undefined
                  : search.has_system_access
                    ? "yes"
                    : "no"
              }
              onChange={(value) =>
                setSearch({
                  has_system_access: value === undefined ? undefined : value === "yes",
                })
              }
              options={ACCESS_OPTIONS}
            />
          </>
        }
        action={
          <Can permission="hr:staff:create">
            <Button asChild>
              <Link to="/hr/staff/new">
                <Plus />
                Add staff
              </Link>
            </Button>
          </Can>
        }
      />

      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <LoadError message={error.message} />
      ) : staff.length === 0 ? (
        <SectionEmpty
          icon={Users}
          title={filtered ? "No staff match these filters" : "No staff yet"}
          description={
            filtered
              ? "Try a different search or clear the filters."
              : "Add the people who work for the company."
          }
          className="bg-card py-14"
          action={
            filtered ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("")
                  setSearch({
                    search: "",
                    status: undefined,
                    department_id: undefined,
                    position_id: undefined,
                    has_system_access: undefined,
                  })
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {formatPlural(data?.pagination.total ?? staff.length, {
              singular: "staff member",
              plural: "staff members",
            })}
          </p>
          <TableCard>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Hired</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <Link
                        to="/hr/staff/$staffId/view"
                        params={{ staffId: person.id }}
                        className="font-medium hover:underline"
                      >
                        {person.name}
                      </Link>
                      <p className="font-mono text-xs text-muted-foreground">
                        {person.number}
                      </p>
                    </TableCell>
                    <TableCell>{person.department?.name ?? "—"}</TableCell>
                    <TableCell>{person.position?.name ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(person.hire_date)}
                    </TableCell>
                    <TableCell>
                      <StaffStatusPill status={person.status} />
                    </TableCell>
                    <TableCell>
                      {person.has_system_access ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <KeyRound className="size-3.5 text-primary" />
                          Allowed
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No login
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
          <Pager
            pagination={data?.pagination}
            onPageChange={(page) => setSearch({ page })}
          />
        </>
      )}
    </div>
  )
}
