import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback, useRef } from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table"
import { z } from "zod"

export const Route = createFileRoute("/_admin/clients/pricing-rates")({
  component: EditableTable,
})

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

function buildRowSchema(colDefs) {
  const shape = {}
  colDefs.forEach(({ key, type }) => {
    shape[key] = zodTypeMap[type] || z.string()
  })
  return z.object(shape)
}

function AddColumnModal({ onAdd, onClose, existingKeys }) {
  const [label, setLabel] = useState("")
  const [type, setType] = useState("string")
  const [error, setError] = useState("")

  const key = label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")

  function handleSubmit() {
    if (!label.trim()) {
      setError("Column name is required")
      return
    }
    if (!key) {
      setError("Label must contain at least one valid character")
      return
    }
    if (existingKeys.includes(key)) {
      setError(`Column "${key}" already exists`)
      return
    }
    onAdd({ key, label: label.trim(), type })
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 12,
          border: "0.5px solid var(--color-border-secondary)",
          padding: "1.5rem",
          width: 340,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <h2
          style={{
            margin: "0 0 1.25rem",
            fontSize: 17,
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
        >
          Add new column
        </h2>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              display: "block",
              marginBottom: 4,
            }}
          >
            Column label
          </label>
          <input
            autoFocus
            value={label}
            onChange={(e) => {
              setLabel(e.target.value)
              setError("")
            }}
            placeholder="e.g. Phone number"
            style={{ width: "100%", boxSizing: "border-box" }}
          />
          {key && (
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-tertiary)",
                margin: "4px 0 0",
              }}
            >
              key: <code style={{ fontFamily: "var(--font-mono)" }}>{key}</code>
            </p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              display: "block",
              marginBottom: 4,
            }}
          >
            Zod type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="string">string — any text</option>
            <option value="number">number — numeric value</option>
            <option value="email">email — valid email</option>
            <option value="url">url — valid URL</option>
            <option value="boolean">boolean — true / false</option>
          </select>
        </div>

        {error && (
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-danger)",
              margin: "0 0 12px",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <i
              className="ti ti-alert-circle"
              style={{ fontSize: 14 }}
              aria-hidden
            />
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ fontSize: 13 }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              fontSize: 13,
              background: "var(--color-text-primary)",
              color: "var(--color-background-primary)",
              border: "none",
              padding: "6px 16px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Add column
          </button>
        </div>
      </div>
    </div>
  )
}

function EditableCell({
  value: initialValue,
  rowId,
  colKey,
  colType,
  onSave,
  schema,
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(initialValue ?? "")
  const [error, setError] = useState("")

  function startEdit() {
    setVal(initialValue ?? "")
    setEditing(true)
    setError("")
  }

  function commit() {
    const shape = {}
    shape[colKey] = zodTypeMap[colType] || z.string()
    const result = z.object(shape).safeParse({ [colKey]: val })
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Invalid")
      return
    }
    onSave(rowId, colKey, val)
    setEditing(false)
    setError("")
  }

  function onKeyDown(e) {
    if (e.key === "Enter") commit()
    if (e.key === "Escape") {
      setEditing(false)
      setError("")
    }
  }

  if (editing) {
    return (
      <div style={{ position: "relative", minWidth: 100 }}>
        {colType === "boolean" ? (
          <select
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={commit}
            autoFocus
            style={{ width: "100%", fontSize: 13 }}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            autoFocus
            value={val}
            onChange={(e) => {
              setVal(e.target.value)
              setError("")
            }}
            onBlur={commit}
            onKeyDown={onKeyDown}
            style={{
              width: "100%",
              fontSize: 13,
              boxSizing: "border-box",
              border: error
                ? "1px solid var(--color-border-danger)"
                : undefined,
            }}
          />
        )}
        {error && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 2px)",
              left: 0,
              zIndex: 10,
              background: "var(--color-background-danger)",
              color: "var(--color-text-danger)",
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 4,
              whiteSpace: "nowrap",
              border: "0.5px solid var(--color-border-danger)",
            }}
          >
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={startEdit}
      title="Click to edit"
      style={{
        cursor: "text",
        padding: "2px 4px",
        borderRadius: 4,
        minHeight: 24,
        minWidth: 60,
        fontSize: 13,
        color: "var(--color-text-primary)",
        transition: "background 0.1s",
        userSelect: "none",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--color-background-secondary)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {initialValue !== undefined && initialValue !== "" ? (
        String(initialValue)
      ) : (
        <span
          style={{
            color: "var(--color-text-tertiary)",
            fontStyle: "italic",
            fontSize: 12,
          }}
        >
          empty
        </span>
      )}
    </div>
  )
}

function EditableTable() {
  const [colDefs, setColDefs] = useState(initialColumns)
  const [data, setData] = useState(initialData)
  const [showAddCol, setShowAddCol] = useState(false)
  const [rowErrors, setRowErrors] = useState({})
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const nextId = useRef(initialData.length + 1)

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

  const handleSaveCell = useCallback((rowId, key, value) => {
    setData((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [key]: value } : r))
    )
    showToast("Cell updated")
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
      const result = schema.safeParse(row)
      if (!result.success) {
        errors[row.id] = result.error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`
        )
      }
    })
    setRowErrors(errors)
    const errCount = Object.keys(errors).length
    if (errCount === 0) showToast("All rows valid ✓")
    else showToast(`${errCount} row(s) have errors`, "danger")
  }

  const columnHelper = createColumnHelper()

  const tableColumns = [
    columnHelper.display({
      id: "rownum",
      header: "#",
      cell: ({ row }) => (
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-tertiary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {row.index + 1}
        </span>
      ),
      size: 36,
    }),
    ...colDefs.map(({ key, label, type }) =>
      columnHelper.accessor(key, {
        header: () => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 4,
            }}
          >
            <span>{label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  padding: "1px 5px",
                  borderRadius: 3,
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-tertiary)",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 400,
                }}
              >
                {type}
              </span>
              {colDefs.length > 1 && (
                <button
                  onClick={() => deleteColumn(key)}
                  title="Remove column"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "1px 3px",
                    color: "var(--color-text-tertiary)",
                    borderRadius: 3,
                    lineHeight: 1,
                    fontSize: 12,
                  }}
                >
                  <i className="ti ti-x" style={{ fontSize: 11 }} aria-hidden />
                </button>
              )}
            </div>
          </div>
        ),
        cell: ({ getValue, row }) => (
          <EditableCell
            value={getValue()}
            rowId={row.original.id}
            colKey={key}
            colType={type}
            onSave={handleSaveCell}
          />
        ),
      })
    ),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => deleteRow(row.original.id)}
          title="Delete row"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "3px 6px",
            color: "var(--color-text-tertiary)",
            borderRadius: 4,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-text-danger)"
            e.currentTarget.style.background = "var(--color-background-danger)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-tertiary)"
            e.currentTarget.style.background = "none"
          }}
        >
          <i className="ti ti-trash" style={{ fontSize: 14 }} aria-hidden />
        </button>
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
    <div style={{ padding: "1.25rem 0", fontFamily: "var(--font-sans)" }}>
      <h2 className="sr-only">
        Editable data table with dynamic columns and Zod validation
      </h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            Pricing table
          </h2>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 13,
              color: "var(--color-text-secondary)",
            }}
          >
            Click any cell to edit · Validated with Zod
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={validateAll} style={{ fontSize: 13 }}>
            <i
              className="ti ti-shield-check"
              style={{ fontSize: 14, verticalAlign: -2, marginRight: 5 }}
              aria-hidden
            />
            Validate all
          </button>
          <button onClick={() => setShowAddCol(true)} style={{ fontSize: 13 }}>
            <i
              className="ti ti-table-plus"
              style={{ fontSize: 14, verticalAlign: -2, marginRight: 5 }}
              aria-hidden
            />
            Add column
          </button>
          <button
            onClick={addRow}
            style={{
              fontSize: 13,
              background: "var(--color-text-primary)",
              color: "var(--color-background-primary)",
              border: "none",
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            <i
              className="ti ti-plus"
              style={{ fontSize: 14, verticalAlign: -2, marginRight: 5 }}
              aria-hidden
            />
            Add row
          </button>
        </div>
      </div>

      <div
        style={{
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "auto",
            }}
          >
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr
                  key={hg.id}
                  style={{
                    background: "var(--color-background-secondary)",
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--color-text-secondary)",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => {
                const errors = rowErrors[row.original.id]
                return (
                  <>
                    <tr
                      key={row.id}
                      style={{
                        borderBottom:
                          "0.5px solid var(--color-border-tertiary)",
                        background: errors
                          ? "var(--color-background-danger)"
                          : i % 2 === 0
                            ? "var(--color-background-primary)"
                            : "var(--color-background-secondary)",
                        transition: "background 0.1s",
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{
                            padding: "6px 12px",
                            verticalAlign: "middle",
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                    {errors && (
                      <tr
                        key={`${row.id}-err`}
                        style={{ background: "var(--color-background-danger)" }}
                      >
                        <td
                          colSpan={tableColumns.length}
                          style={{ padding: "4px 12px 8px" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            {errors.map((e, j) => (
                              <span
                                key={j}
                                style={{
                                  fontSize: 11,
                                  color: "var(--color-text-danger)",
                                  background: "var(--color-background-primary)",
                                  border:
                                    "0.5px solid var(--color-border-danger)",
                                  padding: "2px 7px",
                                  borderRadius: 4,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 3,
                                }}
                              >
                                <i
                                  className="ti ti-alert-circle"
                                  style={{ fontSize: 12 }}
                                  aria-hidden
                                />
                                {e}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={tableColumns.length}
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "var(--color-text-tertiary)",
                      fontSize: 13,
                    }}
                  >
                    No rows yet. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "var(--color-text-tertiary)",
          }}
        >
          {data.length} row{data.length !== 1 ? "s" : ""} · {colDefs.length}{" "}
          column{colDefs.length !== 1 ? "s" : ""}
        </p>
        {Object.keys(rowErrors).length > 0 && (
          <button
            onClick={() => setRowErrors({})}
            style={{
              fontSize: 12,
              color: "var(--color-text-tertiary)",
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            Clear validation errors
          </button>
        )}
      </div>

      {showAddCol && (
        <AddColumnModal
          onAdd={handleAddColumn}
          onClose={() => setShowAddCol(false)}
          existingKeys={colDefs.map((c) => c.key)}
        />
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 2000,
            background:
              toast.type === "danger"
                ? "var(--color-background-danger)"
                : "var(--color-background-success)",
            color:
              toast.type === "danger"
                ? "var(--color-text-danger)"
                : "var(--color-text-success)",
            border: `0.5px solid ${toast.type === "danger" ? "var(--color-border-danger)" : "var(--color-border-success)"}`,
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          <i
            className={`ti ti-${toast.type === "danger" ? "alert-circle" : "circle-check"}`}
            style={{ fontSize: 14 }}
            aria-hidden
          />
          {toast.msg}
        </div>
      )}
    </div>
  )
}
