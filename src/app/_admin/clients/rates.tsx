import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback, useRef, useEffect } from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table"
import { z } from "zod"

// shadcn/ui
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const Route = createFileRoute("/_admin/clients/rates")({
  component: EditableTable,
})

// lucide icons
import {
  ShieldCheck,
  TableProperties,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronRight,
} from "lucide-react"

// ── Zod helpers ───────────────────────────────────────────────────────────────
const zodTypeMap = {
  string: z.string().min(1, "Required"),
  number: z.coerce.number({ error: "Must be a number" }),
  email: z.email("Invalid email"),
  url: z.url("Invalid URL"),
  boolean: z.enum(["true", "false"], {
    error: "Must be true or false",
  }),
}
const typeDefaults = {
  string: "",
  number: "",
  email: "",
  url: "",
  boolean: "false",
}

const ZOD_TYPE_OPTIONS = [
  { value: "string", label: "string", desc: "any text" },
  { value: "number", label: "number", desc: "numeric value" },
  { value: "email", label: "email", desc: "valid email" },
  { value: "url", label: "url", desc: "valid URL" },
  { value: "boolean", label: "boolean", desc: "true / false" },
]

// ── Seed data ─────────────────────────────────────────────────────────────────
const initialColumns = [
  { key: "name", label: "Name", type: "string" },
  { key: "email", label: "Email", type: "email" },
  { key: "age", label: "Age", type: "number" },
]
const initialData = [
  { id: 1, name: "Alice Nakamura", email: "alice@example.com", age: "28" },
  { id: 2, name: "Ben Okafor", email: "ben@example.com", age: "34" },
  { id: 3, name: "Clara Mendes", email: "clara@example.com", age: "22" },
]

const COLUMN_GROUPS = [
  "score",
  "price",
  "temperature",
  "weight",
  "duration",
  "count",
  "rating",
  "latency",
]
const COLUMN_BOUNDS = [
  "min",
  "max",
  "avg",
  "p50",
  "p95",
  "p99",
  "sum",
  "stddev",
]

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
function buildRowSchema(colDefs) {
  const shape = {}
  colDefs.forEach(({ key, type }) => {
    shape[key] = zodTypeMap[type] || z.string()
  })
  return z.object(shape)
}

// ── Kbd chip ──────────────────────────────────────────────────────────────────
function Kbd({ children }: React.PropsWithChildren) {
  return (
    <kbd className="inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
      {children}
    </kbd>
  )
}

// ── Add Column Dialog ─────────────────────────────────────────────────────────
function AddColumnDialog({ open, onAdd, onClose, existingKeys }) {
  const [mode, setMode] = useState("compound")
  const [group, setGroup] = useState(COLUMN_GROUPS[0])
  const [bound, setBound] = useState(COLUMN_BOUNDS[0])
  const [customLabel, setCustomLabel] = useState("")
  const [type, setType] = useState("number")
  const [err, setErr] = useState("")

  const compoundKey = `${bound}_${group}`
  const compoundLabel = `${cap(bound)} ${cap(group)}`
  const customKey = customLabel
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")

  const finalKey = mode === "compound" ? compoundKey : customKey
  const finalLabel = mode === "compound" ? compoundLabel : customLabel.trim()

  function submit() {
    if (!finalLabel) {
      setErr("Column name is required")
      return
    }
    if (!finalKey) {
      setErr("Label must contain a valid character")
      return
    }
    if (existingKeys.includes(finalKey)) {
      setErr(`"${finalKey}" already exists`)
      return
    }
    onAdd({ key: finalKey, label: finalLabel, type })
    // reset
    setMode("compound")
    setGroup(COLUMN_GROUPS[0])
    setBound(COLUMN_BOUNDS[0])
    setCustomLabel("")
    setType("number")
    setErr("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add column</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Mode tabs */}
          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v)
              setErr("")
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="compound" className="flex-1">
                Bound · metric
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex-1">
                Custom name
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {mode === "compound" ? (
            <div className="space-y-3">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Bound</Label>
                  <Select
                    value={bound}
                    onValueChange={(v) => {
                      setBound(v)
                      setErr("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMN_BOUNDS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ChevronRight className="mb-2.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex-[2] space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Metric
                  </Label>
                  <Select
                    value={group}
                    onValueChange={(v) => {
                      setGroup(v)
                      setErr("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMN_GROUPS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-baseline gap-2 rounded-md border bg-muted/40 px-3 py-2">
                <span className="text-sm font-medium">{finalLabel}</span>
                <code className="font-mono text-xs text-muted-foreground">
                  {finalKey}
                </code>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input
                autoFocus
                value={customLabel}
                onChange={(e) => {
                  setCustomLabel(e.target.value)
                  setErr("")
                }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="e.g. Phone number"
              />
              {customKey && (
                <p className="font-mono text-xs text-muted-foreground">
                  key: {customKey}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Zod type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZOD_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    <span className="font-mono text-xs">{o.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      — {o.desc}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {err && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="size-3.5" />
              <AlertDescription className="text-xs">{err}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Add column</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Editable Cell ─────────────────────────────────────────────────────────────
function EditableCell({
  value: initialValue,
  rowId,
  colKey,
  colType,
  onSave,
  registerRef,
  onNav,
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(initialValue ?? "")
  const [error, setError] = useState("")
  const divRef = useRef(null)

  useEffect(() => {
    registerRef({ focus: () => divRef.current?.focus() })
  })
  useEffect(() => {
    if (!editing) setVal(initialValue ?? "")
  }, [initialValue])

  function startEdit() {
    setVal(initialValue ?? "")
    setEditing(true)
    setError("")
  }

  function commit(andNav) {
    const result = z
      .object({ [colKey]: zodTypeMap[colType] || z.string() })
      .safeParse({ [colKey]: val })
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Invalid")
      return false
    }
    onSave(rowId, colKey, val)
    setEditing(false)
    setError("")
    if (andNav) setTimeout(() => onNav(andNav), 0)
    return true
  }

  function onInputKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault()
      commit(e.shiftKey ? "up" : "down")
    }
    if (e.key === "Tab") {
      e.preventDefault()
      commit(e.shiftKey ? "left" : "right")
    }
    if (e.key === "Escape") {
      setEditing(false)
      setError("")
      setTimeout(() => divRef.current?.focus(), 0)
    }
  }

  function onDivKeyDown(e) {
    if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault()
      startEdit()
      return
    }
    const NAV = {
      ArrowRight: "right",
      ArrowLeft: "left",
      ArrowUp: "up",
      ArrowDown: "down",
    }
    if (NAV[e.key]) {
      e.preventDefault()
      onNav(NAV[e.key])
      return
    }
    if (e.key === "Tab") {
      e.preventDefault()
      onNav(e.shiftKey ? "left" : "right")
    }
  }

  if (editing)
    return (
      <div className="relative min-w-[90px]">
        {colType === "boolean" ? (
          <Select value={val} onValueChange={(v) => setVal(v)}>
            <SelectTrigger className="h-7 text-xs" autoFocus>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">true</SelectItem>
              <SelectItem value="false">false</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Input
            autoFocus
            value={val}
            onChange={(e) => {
              setVal(e.target.value)
              setError("")
            }}
            onBlur={() => commit()}
            onKeyDown={onInputKeyDown}
            className={`h-7 text-xs ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
        )}
        {error && (
          <div className="absolute top-[calc(100%+3px)] left-0 z-20 rounded-md border border-destructive bg-destructive/10 px-2 py-1 text-[11px] whitespace-nowrap text-destructive">
            {error}
          </div>
        )}
      </div>
    )

  return (
    <div
      ref={divRef}
      tabIndex={0}
      onClick={startEdit}
      onKeyDown={onDivKeyDown}
      className="min-h-6 min-w-[60px] cursor-text rounded px-1 py-0.5 text-sm transition-colors outline-none select-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      {initialValue !== undefined && initialValue !== "" ? (
        String(initialValue)
      ) : (
        <span className="text-xs text-muted-foreground italic">—</span>
      )}
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null
  const isErr = toast.type === "danger"
  return (
    <div
      className={`fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg ${
        isErr
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
      }`}
    >
      {isErr ? (
        <AlertCircle className="size-4 shrink-0" />
      ) : (
        <CheckCircle2 className="size-4 shrink-0" />
      )}
      {toast.msg}
    </div>
  )
}

// ── Main Table ────────────────────────────────────────────────────────────────
export default function EditableTable() {
  const [colDefs, setColDefs] = useState(initialColumns)
  const [data, setData] = useState(initialData)
  const [showAddCol, setShowAddCol] = useState(false)
  const [rowErrors, setRowErrors] = useState({})
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const nextId = useRef(initialData.length + 1)
  const cellHandles = useRef({})

  function getHandle(ri, ci) {
    return cellHandles.current[ri]?.[ci]
  }
  function setHandle(ri, ci, h) {
    if (!cellHandles.current[ri]) cellHandles.current[ri] = {}
    cellHandles.current[ri][ci] = h
  }

  function navigateFrom(ri, ci, dir) {
    const cols = colDefs.length,
      rows = data.length
    let nr = ri,
      nc = ci
    if (dir === "right") {
      nc++
      if (nc >= cols) {
        nc = 0
        nr = Math.min(ri + 1, rows - 1)
      }
    }
    if (dir === "left") {
      nc--
      if (nc < 0) {
        nc = cols - 1
        nr = Math.max(ri - 1, 0)
      }
    }
    if (dir === "down") {
      nr = Math.min(ri + 1, rows - 1)
    }
    if (dir === "up") {
      nr = Math.max(ri - 1, 0)
    }
    getHandle(nr, nc)?.focus()
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

  const handleSaveCell = useCallback((rowId, key, value) => {
    setData((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [key]: value } : r))
    )
  }, [])

  function addRow() {
    const defaults = { id: nextId.current++ }
    colDefs.forEach(({ key, type }) => {
      defaults[key] = typeDefaults[type] ?? ""
    })
    setData((prev) => [...prev, defaults])
    showToast("Row added")
  }

  function deleteRow(id) {
    setData((prev) => prev.filter((r) => r.id !== id))
    showToast("Row deleted", "danger")
  }

  function handleAddColumn({ key, label, type }) {
    setColDefs((prev) => [...prev, { key, label, type }])
    setData((prev) =>
      prev.map((r) => ({ ...r, [key]: typeDefaults[type] ?? "" }))
    )
    showToast(`Column "${label}" added`)
  }

  function deleteColumn(key) {
    setColDefs((prev) => prev.filter((c) => c.key !== key))
    setData((prev) =>
      prev.map((r) => {
        const { [key]: _, ...rest } = r
        return rest
      })
    )
    showToast("Column removed", "danger")
  }

  function validateAll() {
    const schema = buildRowSchema(colDefs)
    const errors = {}
    data.forEach((row) => {
      const r = schema.safeParse(row)
      if (!r.success)
        errors[row.id] = r.error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`
        )
    })
    setRowErrors(errors)
    const n = Object.keys(errors).length
    if (n === 0) showToast("All rows valid ✓")
    else showToast(`${n} row(s) have errors`, "danger")
  }

  const columnHelper = createColumnHelper()

  const tableColumns = [
    columnHelper.display({
      id: "rownum",
      header: () => <span className="text-muted-foreground">#</span>,
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {row.index + 1}
        </span>
      ),
      size: 36,
    }),
    ...colDefs.map(({ key, label, type }, ci) =>
      columnHelper.accessor(key, {
        header: () => (
          <div className="group flex items-center justify-between gap-1.5">
            <span>{label}</span>
            <div className="flex items-center gap-1">
              <Badge
                variant="secondary"
                className="h-4 px-1.5 py-0 font-mono text-[10px]"
              >
                {type}
              </Badge>
              {colDefs.length > 1 && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => deleteColumn(key)}
                      >
                        <X className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Remove column
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        ),
        cell: ({ getValue, row }) => {
          const ri = row.index
          return (
            <EditableCell
              value={getValue()}
              rowId={row.original.id}
              colKey={key}
              colType={type}
              onSave={handleSaveCell}
              registerRef={(h) => setHandle(ri, ci, h)}
              onNav={(dir) => navigateFrom(ri, ci, dir)}
            />
          )
        },
      })
    ),
    columnHelper.display({
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => deleteRow(row.original.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Delete row
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      size: 40,
    }),
  ]

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-3 p-4 font-sans">
      <h2 className="sr-only">
        Editable data table with keyboard navigation and Zod validation
      </h2>

      {/* Toolbar */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-medium">Data table</h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>
              <Kbd>↑↓←→</Kbd> navigate
            </span>
            <span className="text-border">·</span>
            <span>
              <Kbd>Enter</Kbd> edit / confirm
            </span>
            <span className="text-border">·</span>
            <span>
              <Kbd>Tab</Kbd> next cell
            </span>
            <span className="text-border">·</span>
            <span>
              <Kbd>Esc</Kbd> cancel
            </span>
            <span className="text-border">·</span>
            <span>
              <Kbd>⇧ Enter</Kbd> move up
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={validateAll}
            className="h-8 text-xs"
          >
            <ShieldCheck className="mr-1.5 size-3.5" />
            Validate all
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddCol(true)}
            className="h-8 text-xs"
          >
            <TableProperties className="mr-1.5 size-3.5" />
            Add column
          </Button>
          <Button size="sm" onClick={addRow} className="h-8 text-xs">
            <Plus className="mr-1.5 size-3.5" />
            Add row
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-muted/40">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-9 text-xs font-medium whitespace-nowrap"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                const errors = rowErrors[row.original.id]
                return (
                  <>
                    <TableRow
                      key={row.id}
                      className={
                        errors
                          ? "bg-destructive/5 hover:bg-destructive/10"
                          : undefined
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-1.5 align-middle"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {errors && (
                      <TableRow
                        key={`${row.id}-err`}
                        className="border-t-0 bg-destructive/5 hover:bg-destructive/5"
                      >
                        <TableCell
                          colSpan={tableColumns.length}
                          className="pt-0 pb-2"
                        >
                          <div className="flex flex-wrap gap-1.5">
                            {errors.map((e, j) => (
                              <Badge
                                key={j}
                                variant="destructive"
                                className="gap-1 text-[10px] font-normal"
                              >
                                <AlertCircle className="size-3 shrink-0" />
                                {e}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
              {data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No rows yet. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {data.length} row{data.length !== 1 ? "s" : ""} · {colDefs.length}{" "}
          column{colDefs.length !== 1 ? "s" : ""}
        </p>
        {Object.keys(rowErrors).length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={() => setRowErrors({})}
          >
            Clear errors
          </Button>
        )}
      </div>

      <AddColumnDialog
        open={showAddCol}
        onAdd={handleAddColumn}
        onClose={() => setShowAddCol(false)}
        existingKeys={colDefs.map((c) => c.key)}
      />

      <Toast toast={toast} />
    </div>
  )
}
