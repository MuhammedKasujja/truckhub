import * as React from "react"
import { ArrowDown, ArrowUp, Circle, MapPin, Plus, X } from "lucide-react"

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
import { Label } from "@/components/ui/label"
import { Route } from "@/features/quotations/schemas"


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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Edit route</Button>}
      </DialogTrigger>

      <DialogContent className="ring-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit route</DialogTitle>
          <DialogDescription>
            Set the origin, add checkpoints in the order they must be visited,
            then set the destination.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid gap-0">
            {/* Origin */}
            <Stop icon={<Circle className="size-3.5 fill-current" />} line>
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                placeholder="Where are you starting?"
                value={route.origin}
                onChange={(e) =>
                  setRoute((r) => ({ ...r, origin: e.target.value }))
                }
              />
            </Stop>

            {/* Checkpoints */}
            {route.checkpoints.map((cp, i) => (
              <Stop key={i} icon={<Circle className="size-2.5" />} line>
                <Label htmlFor={`checkpoint-${i}`}>Checkpoint {i + 1}</Label>
                <div className="flex items-center gap-1">
                  <Input
                    id={`checkpoint-${i}`}
                    placeholder="Add a stop"
                    value={cp}
                    onChange={(e) => setCheckpoint(i, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    disabled={i === 0}
                    onClick={() => moveCheckpoint(i, -1)}
                    aria-label={`Move checkpoint ${i + 1} up`}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    disabled={i === route.checkpoints.length - 1}
                    onClick={() => moveCheckpoint(i, 1)}
                    aria-label={`Move checkpoint ${i + 1} down`}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => removeCheckpoint(i)}
                    aria-label={`Remove checkpoint ${i + 1}`}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </Stop>
            ))}

            {/* Add checkpoint */}
            <Stop icon={<Plus className="size-3.5" />} line>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 w-fit"
                disabled={route.checkpoints.length >= maxCheckpoints}
                onClick={addCheckpoint}
              >
                Add checkpoint
              </Button>
            </Stop>

            {/* Destination */}
            <Stop icon={<MapPin className="size-4" />}>
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="Where are you going?"
                value={route.destination}
                onChange={(e) =>
                  setRoute((r) => ({ ...r, destination: e.target.value }))
                }
              />
            </Stop>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Save route
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** One row of the route timeline: icon + connecting line + content */
function Stop({
  icon,
  line,
  children,
}: {
  icon: React.ReactNode
  line?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <div className="flex w-5 flex-col items-center pt-7 text-muted-foreground">
        {icon}
        {line && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>
      <div className="grid flex-1 gap-1.5 pb-4">{children}</div>
    </div>
  )
}

export function RouteSummary({
  route,
  onEdit,
}: {
  route?: Route
  onEdit: (route: Route) => void
}) {
  if (!route) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm font-medium">No route set</p>
        <p className="mb-4 text-sm text-muted-foreground">
          Add an origin, checkpoints, and a destination.
        </p>
        <RouteDialog
          onConfirm={onEdit}
          trigger={<Button size="sm">Add route</Button>}
        />
      </div>
    )
  }

  const stops = [
    { label: "Origin", name: route.origin },
    ...route.checkpoints.map((name, i) => ({
      label: `Checkpoint ${i + 1}`,
      name,
    })),
    { label: "Destination", name: route.destination },
  ]

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Route</p>
          <p className="text-sm text-muted-foreground">{stops.length} stops</p>
        </div>
        <RouteDialog value={route} onConfirm={onEdit} />
      </div>
      <ol>
        {stops.map((s, i) => (
          <li key={i} className="flex gap-3">
            <div className="flex w-5 flex-col items-center pt-1 text-muted-foreground">
              {i === stops.length - 1 ? (
                <MapPin className="size-4" />
              ) : (
                <Circle
                  className={
                    i === 0 ? "mt-0.5 size-3.5 fill-current" : "mt-1 size-2.5"
                  }
                />
              )}
              {i < stops.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-border" />
              )}
            </div>
            <div className="pb-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-sm font-medium">{s.name}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
