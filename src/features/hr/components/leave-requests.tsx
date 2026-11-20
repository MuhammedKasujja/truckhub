import { useEffect, useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { CalendarClock, CalendarPlus, Check, X } from "lucide-react"
import {
  leaveRequestsQueryOptions,
  leaveTypesQueryOptions,
  staffListQueryOptions,
} from "../query-options"
import { LeaveRequestCreateSchema } from "../schemas"
import {
  approveLeaveRequestFn,
  cancelLeaveRequestFn,
  createLeaveRequestFn,
  rejectLeaveRequestFn,
} from "../services"
import { useHrAction } from "../use-hr-action"
import { LEAVE_STATUS_OPTIONS, formatDays } from "../labels"
import {
  FilterSelect,
  LeaveStatusPill,
  ListSkeleton,
  LoadError,
  Pager,
  TableCard,
} from "./hr-ui"
import type z from "zod"
import type { LeaveRequestSearch } from "../schemas"
import type { LeaveRequest } from "../types"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Can } from "@/components/has-permission"
import {
  DatePickerField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-fields"
import { Textarea } from "@/components/ui/textarea"
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
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { formatDate } from "@/lib/format"

const ACTIVE_STAFF = { page: 1, perPage: 100, search: "", status: "active" } as const

export function formatLeaveDates(request: Pick<LeaveRequest, "start_date" | "end_date">) {
  return request.start_date === request.end_date
    ? formatDate(request.start_date)
    : `${formatDate(request.start_date)} – ${formatDate(request.end_date)}`
}

/** Only leave that hasn't started can still be cancelled. */
export function canCancelLeave(request: LeaveRequest) {
  if (request.status === "pending") return true
  return (
    request.status === "approved" &&
    request.start_date > new Date().toLocaleDateString("en-CA")
  )
}

type Decision = { kind: "approve" | "reject"; request: LeaveRequest }

export function LeaveRequests() {
  const search = useSearch({ from: "/_admin/hr/leave/" })
  const navigate = useNavigate({ from: "/hr/leave/" })
  const { hasPermission } = usePermissions()
  const { data, isLoading, error } = useQuery(leaveRequestsQueryOptions(search))

  const setSearch = (updates: Partial<LeaveRequestSearch>) =>
    navigate({ search: (prev) => ({ ...prev, page: 1, ...updates }), replace: true })

  const [fileOpen, setFileOpen] = useState(false)
  const [decision, setDecision] = useState<Decision>()
  const [cancelling, setCancelling] = useState<LeaveRequest>()

  const cancel = useHrAction(
    (id: string) => cancelLeaveRequestFn({ data: { id } }),
    { onDone: () => setCancelling(undefined) }
  )

  const requests = data?.data ?? []
  const canDecide = hasPermission("hr:leave:approve")
  const canFile = hasPermission("hr:leave:file")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          label="Status"
          allLabel="Any status"
          value={search.status}
          onChange={(status) => setSearch({ status })}
          options={LEAVE_STATUS_OPTIONS}
        />
        {search.staff_id && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearch({ staff_id: undefined })}
          >
            <X />
            Showing one staff member
          </Button>
        )}
        {canFile && (
          <Button className="ml-auto" onClick={() => setFileOpen(true)}>
            <CalendarPlus />
            File leave
          </Button>
        )}
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <LoadError message={error.message} />
      ) : requests.length === 0 ? (
        <SectionEmpty
          icon={CalendarClock}
          title={
            search.status === "pending"
              ? "Nothing is waiting for a decision"
              : "No leave requests"
          }
          description="Requests appear here when staff ask for leave or you file it for them."
          className="bg-card py-14"
        />
      ) : (
        <>
          <TableCard>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff member</TableHead>
                  <TableHead>Leave</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Link
                        to="/hr/staff/$staffId/view"
                        params={{ staffId: request.staff_id }}
                        className="font-medium hover:underline"
                      >
                        {request.staff.name}
                      </Link>
                      {request.reason && (
                        <p className="max-w-xs truncate text-xs text-muted-foreground">
                          {request.reason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.leave_type.name}
                      {!request.leave_type.is_paid && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (unpaid)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatLeaveDates(request)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatDays(request.days)}
                    </TableCell>
                    <TableCell>
                      <LeaveStatusPill status={request.status} />
                      {request.decision_note && (
                        <p className="max-w-48 truncate text-xs text-muted-foreground">
                          {request.decision_note}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {canDecide && request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => setDecision({ kind: "approve", request })}
                            >
                              <Check />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDecision({ kind: "reject", request })}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {canFile && canCancelLeave(request) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCancelling(request)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
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

      <Can permission="hr:leave:file">
        <FileLeaveDialog open={fileOpen} onOpenChange={setFileOpen} />
      </Can>
      <DecisionDialog decision={decision} onClose={() => setDecision(undefined)} />
      <ConfirmDialog
        open={!!cancelling}
        onOpenChange={(open) => !open && setCancelling(undefined)}
        isLoading={cancel.isPending}
        title="Cancel this leave?"
        description={
          cancelling?.status === "approved"
            ? "The days go back to their balance."
            : "The request is withdrawn."
        }
        confirmLabel="Cancel leave"
        onConfirm={() => cancelling && cancel.run(cancelling.id)}
      />
    </div>
  )
}

function FileLeaveDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  type Values = z.infer<typeof LeaveRequestCreateSchema>
  const { data: staff } = useQuery({
    ...staffListQueryOptions(ACTIVE_STAFF),
    enabled: open,
  })
  const { data: types = [] } = useQuery({
    ...leaveTypesQueryOptions(),
    enabled: open,
  })

  const empty = { staff_id: "", leave_type_id: "", start_date: "", end_date: "", reason: "" }
  const form = useForm<Values>({
    resolver: zodResolver(LeaveRequestCreateSchema),
    defaultValues: empty,
  })
  useEffect(() => {
    if (open) form.reset(empty)
  }, [open])

  const file = useHrAction(
    (data: Values) => createLeaveRequestFn({ data }),
    { onDone: () => onOpenChange(false) }
  )

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={CalendarPlus}
      eyebrow="Leave"
      title="File leave for a staff member"
      description="Weekends and public holidays inside the dates aren't counted. The request still needs approving."
      submitText="File leave"
      isSubmitting={file.isPending}
      onSubmit={form.handleSubmit((values) => file.run(values))}
    >
      <SelectField
        label="Staff member"
        name="staff_id"
        control={form.control}
        options={(staff?.data ?? []).map((s) => ({ value: s.id, label: s.name }))}
      />
      <LeaveFields control={form.control} types={types} />
    </SettingsFormDialog>
  )
}

/** Leave type, dates and reason: shared by HR filing and self-service. */
export function LeaveFields({
  control,
  types,
}: {
  // The two forms differ only in fields outside this group.
  control: any
  types: { id: string; name: string; is_active: boolean; is_paid: boolean }[]
}) {
  return (
    <>
      <SelectField
        label="Type of leave"
        name="leave_type_id"
        control={control}
        options={types
          .filter((t) => t.is_active)
          .map((t) => ({
            value: t.id,
            label: t.is_paid ? t.name : `${t.name} (unpaid)`,
          }))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePickerField
          label="First day"
          name="start_date"
          control={control}
          placeholder="Pick a date"
        />
        <DatePickerField
          label="Last day"
          name="end_date"
          control={control}
          placeholder="Pick a date"
        />
      </div>
      <TextareaField
        label="Reason"
        name="reason"
        control={control}
        required={false}
      />
    </>
  )
}

function DecisionDialog({
  decision,
  onClose,
}: {
  decision: Decision | undefined
  onClose: () => void
}) {
  const [note, setNote] = useState("")
  useEffect(() => setNote(""), [decision?.request.id, decision?.kind])

  const decide = useHrAction(
    (input: { kind: Decision["kind"]; id: string; note: string }) =>
      (input.kind === "approve" ? approveLeaveRequestFn : rejectLeaveRequestFn)({
        data: { id: input.id, note: input.note },
      }),
    { onDone: onClose }
  )

  const approving = decision?.kind === "approve"
  const request = decision?.request

  return (
    <SettingsFormDialog
      open={!!decision}
      onOpenChange={(open) => !open && onClose()}
      icon={approving ? Check : X}
      eyebrow={request?.leave_type.name}
      title={
        request
          ? `${approving ? "Approve" : "Reject"} ${request.staff.name}'s leave`
          : "Leave request"
      }
      description={
        request
          ? `${formatLeaveDates(request)} · ${formatDays(request.days)}${
              approving && request.leave_type.is_paid
                ? ". The days come off their balance."
                : ""
            }`
          : undefined
      }
      size="sm"
      submitText={approving ? "Approve" : "Reject"}
      isSubmitting={decide.isPending}
      onSubmit={(event) => {
        event.preventDefault()
        if (decision) decide.run({ kind: decision.kind, id: decision.request.id, note })
      }}
    >
      <div className="space-y-1.5">
        <label htmlFor="decision-note" className="text-sm font-medium">
          Note for the staff member{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          id="decision-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1000}
        />
      </div>
    </SettingsFormDialog>
  )
}
