import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { PlusIcon, ReceiptIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { invoiceQueryOptions } from "../query-options"
import { getInvoiceTableColumns } from "./invoice-table-columns"
import { InvoiceTableFilter } from "./invoice-table-filter"
import { VoidInvoiceModal } from "./void-invoice-modal"
import { useDeleteInvoice } from "../hooks/use-invoice-actions"
import type { InvoiceListSearchParams } from "../schemas"
import type { InvoiceTableRowAction } from "../types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { Can } from "@/components/has-permission"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { EnterPaymentModal } from "@/features/payments/components"
import { useDataTable } from "@/hooks/use-data-table"
import { useDebounce } from "@/hooks/use-debounce"
import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"

export function InvoiceTable() {
  const tr = useTranslation()
  const search = useSearch({ from: "/_admin/invoices/" })
  const navigate = useNavigate({ from: "/invoices/" })
  // While a filter change loads, the previous rows stay on screen, dimmed
  const { data, isLoading, isPlaceholderData } = useQuery({
    ...invoiceQueryOptions(search),
    placeholderData: keepPreviousData,
  })
  const [rowAction, setRowAction] = useState<InvoiceTableRowAction | null>(null)

  // Changing a filter always goes back to the first page
  const setSearch = (updates: Partial<InvoiceListSearchParams>) =>
    navigate({
      search: (prev) => ({ ...prev, page: undefined, ...updates }),
      replace: true,
    })

  // The query lives in the URL; type freely, then update it once typing stops.
  const [query, setQuery] = useState(search.search)
  const debouncedQuery = useDebounce(query, 350)
  useEffect(() => {
    if (debouncedQuery !== search.search) {
      setSearch({ search: debouncedQuery || undefined })
    }
  }, [debouncedQuery])

  const columns = useMemo(
    () => getInvoiceTableColumns({ tr, setRowAction }),
    [tr]
  )

  const invoices = data?.data ?? []
  const { table } = useDataTable({
    data: invoices,
    columns,
    pageCount: data?.pagination.totalPages ?? 1,
    initialState: {
      sorting: [{ id: "id", desc: true }],
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  })

  const isFiltered =
    !!search.search ||
    !!search.status?.length ||
    !!search.client_id ||
    !!search.created_at?.length
  const clearFilters = () => {
    setQuery("")
    setSearch({
      search: undefined,
      status: undefined,
      client_id: undefined,
      created_at: undefined,
    })
  }
  const closeRowAction = () => setRowAction(null)
  const { deleteInvoice, isPending: isDeleting } = useDeleteInvoice()

  return (
    <div className="flex flex-col gap-4">
      <InvoiceTableFilter
        search={query}
        onSearchChange={setQuery}
        filters={search}
        onFiltersChange={setSearch}
      />
      {isLoading ? (
        <DataTableSkeleton columnCount={7} rowCount={10} shrinkZero />
      ) : invoices.length === 0 ? (
        <Empty
          className={cn(
            "border bg-card py-14 transition-opacity",
            isPlaceholderData && "opacity-60"
          )}
        >
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptIcon />
            </EmptyMedia>
            <EmptyTitle>
              {isFiltered ? "No invoices match these filters" : "No invoices yet"}
            </EmptyTitle>
            <EmptyDescription>
              {isFiltered
                ? "Try a different search or clear the filters."
                : "Invoices you create from quotations will show up here."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {isFiltered ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Can permission="invoices:create">
                <Button size="sm" asChild>
                  <Link to="/invoices/create">
                    <PlusIcon />
                    Create Invoice
                  </Link>
                </Button>
              </Can>
            )}
          </EmptyContent>
        </Empty>
      ) : (
        <DataTable
          table={table}
          aria-busy={isPlaceholderData}
          className={cn(
            "transition-opacity",
            isPlaceholderData && "opacity-60"
          )}
        />
      )}
      <EnterPaymentModal
        key={rowAction?.row.id}
        open={rowAction?.variant === "makePayment"}
        onOpenChange={closeRowAction}
        initialData={{
          entityId: rowAction?.row.id,
          amount: rowAction?.row.original.balance_due,
          type: "invoice",
        }}
      />
      {rowAction?.variant === "void" && (
        <VoidInvoiceModal
          key={rowAction.row.id}
          open
          onOpenChange={closeRowAction}
          invoice={rowAction.row.original}
        />
      )}
      {rowAction?.variant === "delete" && (
        <ConfirmDialog
          open
          onOpenChange={closeRowAction}
          isLoading={isDeleting}
          title={`Delete invoice ${rowAction.row.original.number}?`}
          description="The client does not owe this invoice. Deleting removes it from the list."
          onConfirm={() =>
            // Closes either way: on failure the action hook shows the reason
            deleteInvoice(rowAction.row.original.id)
              .catch(() => undefined)
              .finally(closeRowAction)
          }
        />
      )}
    </div>
  )
}

/** Stands in for the whole list while the route is loading. */
export function InvoiceTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={7}
      filterCount={1}
      shrinkZero
      rowCount={25}
    />
  )
}
