import { useEffect, useId, useState } from "react"
import { format, parseISO } from "date-fns"
import { Loader2 } from "lucide-react"
import { useRecordDriverTest } from "../hooks/user-driver"
import {
  TEST_NOTES_MAX,
  recordTestResultSchema,
  todayDateInput,
} from "../schemas"
import { toDateInput } from "../driver-record"
import { TEST_STATUSES, labelFor } from "./driver-options"
import type { TestStatus } from "./driver-options"
import type { TestType } from "../enums"
import type { EntityId } from "@/schemas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { DatePicker } from "@/components/ui/form-fields"

export type TestToRecord = {
  type: TestType
  label: string
  status: TestStatus
  tested_on: string | null
  notes: string | null
}

type Props = {
  driverId: EntityId
  /** The test being updated; the dialog is closed while this is undefined. */
  test: TestToRecord | undefined
  onClose: () => void
}

/** How far back the calendar lets a test be dated. */
const EARLIEST_TEST_DATE = new Date(2000, 0)

const SELECTED_TONE: Record<TestStatus, string> = {
  pending: "bg-primary text-primary-foreground shadow-xs",
  passed:
    "bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 dark:text-emerald-950",
  failed: "bg-destructive text-white shadow-xs",
}

/** Record or correct the result of one of a driver's selection tests. */
export function RecordTestDialog({ driverId, test, onClose }: Props) {
  const id = useId()
  const [status, setStatus] = useState<TestStatus>("pending")
  const [testedOn, setTestedOn] = useState("")
  const [notes, setNotes] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { recordTest, isPending } = useRecordDriverTest()

  const open = !!test

  useEffect(() => {
    if (!test) return
    setStatus(test.status)
    setTestedOn(toDateInput(test.tested_on))
    setNotes(test.notes ?? "")
    setSubmitted(false)
    // Only when another test is opened, not on every refetch of the driver
  }, [test?.type, open])

  if (!test) return null

  const isDone = status !== "pending"
  const today = new Date()
  const parsed = recordTestResultSchema.safeParse({
    driverId,
    testType: test.type,
    status,
    testedOn: testedOn || undefined,
    notes,
  })
  const errorFor = (field: string) =>
    submitted && !parsed.success
      ? parsed.error.issues.find((issue) => issue.path[0] === field)?.message
      : undefined
  const dateError = errorFor("testedOn")
  const notesError = errorFor("notes")

  function chooseStatus(next: TestStatus) {
    setStatus(next)
    // Most results are entered on the day of the test
    if (next !== "pending" && !testedOn) setTestedOn(todayDateInput())
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    event.stopPropagation()
    setSubmitted(true)
    if (!parsed.success) return

    try {
      await recordTest({
        driverId,
        testType: parsed.data.testType,
        status: parsed.data.status,
        testedOn: parsed.data.testedOn,
        notes: parsed.data.notes,
      })
      onClose()
    } catch {
      // The action hook has already shown the API's message
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isPending) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{test.label}</DialogTitle>
            <DialogDescription>
              Record the result, or set it back to pending if the test has to be
              taken again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label id={`${id}-status`}>Result</Label>
            <div
              role="radiogroup"
              aria-labelledby={`${id}-status`}
              className="flex rounded-lg border bg-muted/50 p-0.5"
            >
              {TEST_STATUSES.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={status === value}
                  onClick={() => chooseStatus(value)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    status === value && SELECTED_TONE[value]
                  )}
                >
                  {labelFor("testStatus", value)}
                </button>
              ))}
            </div>
          </div>

          {isDone && (
            <div className="space-y-1.5">
              <Label htmlFor={`${id}-date`}>Date of the test</Label>
              <DatePicker
                id={`${id}-date`}
                format="P"
                value={testedOn ? parseISO(testedOn) : undefined}
                startDate={EARLIEST_TEST_DATE}
                endDate={today}
                maxDate={today}
                placeholder="Pick a date"
                aria-invalid={!!dateError}
                onDateChanged={(date) =>
                  setTestedOn(date ? format(date, "yyyy-MM-dd") : "")
                }
              />
              {dateError && (
                <p role="alert" className="text-sm text-destructive">
                  {dateError}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor={`${id}-notes`}>Notes (optional)</Label>
            <Textarea
              id={`${id}-notes`}
              value={notes}
              maxLength={TEST_NOTES_MAX}
              placeholder="e.g. Retest after two weeks"
              aria-invalid={!!notesError}
              onChange={(event) => setNotes(event.target.value)}
            />
            {notesError && (
              <p role="alert" className="text-sm text-destructive">
                {notesError}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Save result
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
