import { createFileRoute } from "@tanstack/react-router"
import React, { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table"
import { Plus, Trash2, Save, X, PlusCircle } from "lucide-react"
type ColumnType = "text" | "number" | "email"

type DynamicColumn = {
  id: string
  header: string
  type: ColumnType
}

type RowData = {
  id: string
  [key: string]: any // Dynamic columns
}

const initialColumns: DynamicColumn[] = [
  { id: "firstName", header: "First Name", type: "text" },
  { id: "lastName", header: "Last Name", type: "text" },
  { id: "age", header: "Age", type: "number" },
]

const initialData: RowData[] = [
  { id: "1", firstName: "John", lastName: "Doe", age: 28 },
  { id: "2", firstName: "Jane", lastName: "Smith", age: 32 },
]

export const Route = createFileRoute("/_admin/clients/pricing")({
  component: RouteComponent,
})

function RouteComponent() {
  const [columns, setColumns] = useState<DynamicColumn[]>(initialColumns)
  const [data, setData] = useState<RowData[]>(initialData)
  const [editingCell, setEditingCell] = useState<{
    rowId: string
    columnId: string
  } | null>(null)
  const [tempValue, setTempValue] = useState<string>("")

  // Add new column
  const addColumn = (type: ColumnType = "text") => {
    const newColumn: DynamicColumn = {
      id: `col_${Date.now()}`,
      header:
        type === "email"
          ? `Email ${columns.filter((c) => c.type === "email").length + 1}`
          : type === "number"
            ? `Number ${columns.filter((c) => c.type === "number").length + 1}`
            : `Column ${columns.length + 1}`,
      type,
    }

    setColumns([...columns, newColumn])

    // Add this column to all existing rows with empty value
    setData((prev) =>
      prev.map((row) => ({
        ...row,
        [newColumn.id]: type === "number" ? 0 : "",
      }))
    )
  }

  const deleteColumn = (columnId: string) => {
    if (["firstName", "lastName", "age"].includes(columnId)) {
      alert("Cannot delete default columns")
      return
    }
    setColumns((prev) => prev.filter((col) => col.id !== columnId))
    setData((prev) =>
      prev.map((row) => {
        const { [columnId]: _, ...rest } = row
        return rest
      })
    )
  }

  const tableColumns = useMemo<ColumnDef<RowData>[]>(() => {
    const dynamicCols = columns.map((col) => ({
      accessorKey: col.id,
      header: () => (
        <div className="group flex items-center gap-2">
          {col.header}
          {!["firstName", "lastName", "age"].includes(col.id) && (
            <button
              onClick={() => deleteColumn(col.id)}
              className="text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
      cell: ({ row, getValue }) =>
        renderEditableCell(row, col.id, getValue(), col.type),
    }))

    // Actions column
    return [
      ...dynamicCols,
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => deleteRow(row.original.id)}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>
        ),
      },
    ]
  }, [columns])

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  function renderEditableCell(
    row: any,
    columnId: string,
    value: any,
    type: ColumnType
  ) {
    const isEditing =
      editingCell?.rowId === row.original.id &&
      editingCell?.columnId === columnId

    const handleDoubleClick = () => {
      setEditingCell({ rowId: row.original.id, columnId })
      setTempValue(value?.toString() || "")
    }

    const saveEdit = () => {
      const newData = data.map((item) => {
        if (item.id === row.original.id) {
          let finalValue: any = tempValue
          if (type === "number") {
            finalValue = parseFloat(tempValue) || 0
          }
          return { ...item, [columnId]: finalValue }
        }
        return item
      })

      setData(newData)
      setEditingCell(null)
    }

    const cancelEdit = () => setEditingCell(null)

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 p-1">
          <input
            type={type === "number" ? "number" : "text"}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit()
              if (e.key === "Escape") cancelEdit()
            }}
            className="w-full rounded border border-blue-500 px-3 py-1 focus:outline-none"
            autoFocus
          />
        </div>
      )
    }

    return (
      <div
        onDoubleClick={handleDoubleClick}
        className="flex min-h-[48px] cursor-pointer items-center px-4 py-3 hover:bg-gray-50"
      >
        {value ?? ""}
      </div>
    )
  }

  const addRow = () => {
    const newRow: RowData = { id: Date.now().toString() }

    columns.forEach((col) => {
      newRow[col.id] = col.type === "number" ? 0 : ""
    })

    setData([...data, newRow])

    setTimeout(() => {
      setEditingCell({ rowId: newRow.id, columnId: columns[0].id })
      setTempValue("")
    }, 10)
  }

  const deleteRow = (id: string) => {
    setData(data.filter((row) => row.id !== id))
  }

  return (
    <div className="">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dynamic Editable Table</h1>

        <div className="flex gap-3">
          <button
            onClick={addRow}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-white hover:bg-green-700"
          >
            <Plus size={20} />
            Add Row
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => addColumn("text")}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700"
            >
              <PlusCircle size={18} />
              Add Text
            </button>
            <button
              onClick={() => addColumn("email")}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-white hover:bg-purple-700"
            >
              <PlusCircle size={18} />
              Add Email
            </button>
            <button
              onClick={() => addColumn("number")}
              className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-white hover:bg-orange-700"
            >
              <PlusCircle size={18} />
              Add Number
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full min-w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-4 text-left font-semibold whitespace-nowrap text-gray-700"
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
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border-r last:border-r-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        💡 Double-click any cell to edit • Use buttons above to add columns and
        rows
      </p>
    </div>
  )
}
