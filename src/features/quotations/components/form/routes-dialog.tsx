import * as React from "react"
import {
  ArrowDown,
  ArrowUp,
  MapPin,
  Navigation,
  Pencil,
  Plus,
  Route as RouteIcon,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Route } from "@/features/quotations/schemas"
import { cn } from "@/lib/utils"

type RouteDialogProps = {
  value?: Route
  onConfirm: (route: Route) => void
  maxCheckpoints?: number
  trigger?: React.ReactNode
}

const empty: Route = { origin: "", checkpoints: [], destination: "" }

export function RouteDialog({
  value = empty,
  onConfirm,
  maxCheckpoints = 10,
  trigger,
}: RouteDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [route, setRoute] = React.useState<Route>(value)

  // Reset the draft to the saved value each time the dialog opens
  React.useEffect(() => {
    if (open) setRoute(value)
  }, [open, value])

  const setCheckpoint = (i: number, text: string) =>
    setRoute((r) => ({
      ...r,
      checkpoints: r.checkpoints.map((c, idx) => (idx === i ? text : c)),
    }))

  const addCheckpoint = () =>
    setRoute((r) => ({ ...r, checkpoints: [...r.checkpoints, ""] }))

  const removeCheckpoint = (i: number) =>
    setRoute((r) => ({
      ...r,
      checkpoints: r.checkpoints.filter((_, idx) => idx !== i),
    }))

  const moveCheckpoint = (i: number, dir: -1 | 1) =>
    setRoute((r) => {
      const next = [...r.checkpoints]
      const j = i + dir
      if (j < 0 || j >= next.length) return r
      ;[next[i], next[j]] = [next[j], next[i]]
      return { ...r, checkpoints: next }
    })

  const canSave =
    route.origin.trim() !== "" &&
    route.destination.trim() !== "" &&
    route.checkpoints.every((c) => c.trim() !== "")

  const handleSave = () => {
    onConfirm({
      origin: route.origin.trim(),
      checkpoints: route.checkpoints.map((c) => c.trim()),
      destination: route.destination.trim(),
    })
    setOpen(false)
  }

  const isNew = !value.origin
  const stopCount = 2 + route.checkpoints.length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline" size="sm">
            <Pencil />
            Edit
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 flex-row items-center gap-4 border-b p-5 pr-12 text-left">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <RouteIcon className="size-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <DialogTitle className="text-lg font-bold tracking-tight">
              {isNew ? "Plan the route" : "Edit route"}
            </DialogTitle>
            <DialogDescription>
              Origin, stops in the order they're visited, then destination.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-5">
          <ol className="rounded-xl border bg-card p-4 shadow-xs">
            {/* Origin */}
            <Stop
              marker={<StopDot kind="origin" />}
              label="Origin"
              htmlFor="route-origin"
            >
              <Input
                id="route-origin"
                autoFocus
                placeholder="Where does the trip start?"
                value={route.origin}
                onChange={(e) =>
                  setRoute((r) => ({ ...r, origin: e.target.value }))
                }
              />
            </Stop>

            {/* Checkpoints */}
            {route.checkpoints.map((cp, i) => (
              <Stop
                key={i}
                marker={<StopDot kind="checkpoint" index={i + 1} />}
                label={`Stop ${i + 1}`}
                htmlFor={`route-checkpoint-${i}`}
              >
                <div className="flex items-center gap-1.5">
                  <Input
                    id={`route-checkpoint-${i}`}
                    autoFocus={cp === "" && i === route.checkpoints.length - 1}
                    placeholder="Town or landmark"
                    value={cp}
                    onChange={(e) => setCheckpoint(i, e.target.value)}
                  />
                  <div className="flex shrink-0 items-center rounded-lg border bg-background">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-r-none"
                      disabled={i === 0}
                      onClick={() => moveCheckpoint(i, -1)}
                      aria-label={`Move stop ${i + 1} up`}
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-none border-x"
                      disabled={i === route.checkpoints.length - 1}
                      onClick={() => moveCheckpoint(i, 1)}
                      aria-label={`Move stop ${i + 1} down`}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-l-none text-muted-foreground hover:text-destructive"
                      onClick={() => removeCheckpoint(i)}
                      aria-label={`Remove stop ${i + 1}`}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </Stop>
            ))}

            {/* Add checkpoint */}
            <li className="flex gap-3">
              <div className="flex w-6 flex-col items-center">
                <span className="w-px flex-1 border-l border-dashed" />
              </div>
              <div className="flex-1 pb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed text-muted-foreground"
                  disabled={route.checkpoints.length >= maxCheckpoints}
                  onClick={addCheckpoint}
                >
                  <Plus />
                  Add a stop
                </Button>
              </div>
            </li>

            {/* Destination */}
            <Stop
              marker={<StopDot kind="destination" />}
              label="Destination"
              htmlFor="route-destination"
              last
            >
              <Input
                id="route-destination"
                placeholder="Where does the trip end?"
                value={route.destination}
                onChange={(e) =>
                  setRoute((r) => ({ ...r, destination: e.target.value }))
                }
              />
            </Stop>
          </ol>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 items-center border-t bg-background p-4">
          <p className="mr-auto hidden text-xs text-muted-foreground sm:block">
            {stopCount} stops
            {route.checkpoints.length >= maxCheckpoints &&
              ` · max ${maxCheckpoints} in between`}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="shadow-sm"
          >
            <Navigation />
            Save route
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function StopDot({
  kind,
  index,
}: {
  kind: "origin" | "checkpoint" | "destination"
  index?: number
}) {
  if (kind === "destination") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-background">
        <MapPin className="size-3.5" />
      </span>
    )
  }
  if (kind === "origin") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full border-2 border-foreground bg-background">
        <span className="size-2 rounded-full bg-foreground" />
      </span>
    )
  }
  return (
    <span className="flex size-6 items-center justify-center rounded-full border bg-background text-[10px] font-semibold text-muted-foreground tabular-nums">
      {index}
    </span>
  )
}

/** One row of the route timeline: marker + connecting line + content */
function Stop({
  marker,
  label,
  htmlFor,
  last,
  children,
}: {
  marker: React.ReactNode
  label: string
  htmlFor: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-3">
      <div className="flex w-6 flex-col items-center pt-6">
        {marker}
        {!last && <span className="mt-1 w-px flex-1 border-l border-dashed" />}
      </div>
      <div className={cn("grid flex-1 gap-1.5", !last && "pb-4")}>
        <label
          htmlFor={htmlFor}
          className="text-xs font-medium text-muted-foreground"
        >
          {label}
        </label>
        {children}
      </div>
    </li>
  )
}

export function RouteSummary({
  route,
  onEdit,
}: {
  route?: Route
  onEdit: (route: Route) => void
}) {
  if (!route?.origin) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed bg-card/50 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <RouteIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">No route yet</p>
          <p className="text-xs text-muted-foreground">
            Optional — shows on the quote as the trip plan.
          </p>
        </div>
        <RouteDialog
          onConfirm={onEdit}
          trigger={
            <Button type="button" size="sm" variant="outline">
              <Plus />
              Add
            </Button>
          }
        />
      </div>
    )
  }

  const stops = [route.origin, ...route.checkpoints, route.destination]

  return (
    <section className="rounded-xl border bg-card p-4 shadow-xs">
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <RouteIcon className="size-4" />
          </span>
          <div>
            <h3 className="text-sm leading-7 font-semibold">Route</h3>
            <p className="-mt-0.5 text-xs text-muted-foreground">
              {stops.length} stops
            </p>
          </div>
        </div>
        <RouteDialog value={route} onConfirm={onEdit} />
      </div>
      <ol>
        {stops.map((name, i) => {
          const isFirst = i === 0
          const isLast = i === stops.length - 1
          return (
            <li key={`${name}-${i}`} className="flex gap-3">
              <div className="flex w-4 flex-col items-center pt-1">
                {isLast ? (
                  <MapPin className="size-4 text-foreground" />
                ) : (
                  <span
                    className={cn(
                      "mt-0.5 size-2.5 rounded-full",
                      isFirst
                        ? "border-2 border-foreground"
                        : "bg-muted-foreground/40"
                    )}
                  />
                )}
                {!isLast && (
                  <span className="mt-1 w-px flex-1 border-l border-dashed" />
                )}
              </div>
              <p
                className={cn(
                  "pb-3 text-sm",
                  isFirst || isLast ? "font-medium" : "text-muted-foreground"
                )}
              >
                {name}
              </p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
