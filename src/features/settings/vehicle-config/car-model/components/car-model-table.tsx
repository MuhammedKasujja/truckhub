import React from "react"
import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { getCarModelColumns } from "./car-model-table-columns"
import { CarModelForm } from "./car-model-form"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createCarModelsListQueryOptions } from "../query-options"
import { useSearch } from "@tanstack/react-router"
import { Can } from "@/components/has-permission"
import { useCreateCarModel } from "../../hooks/use-car-model"

export function CarModelTable() {
  const search = useSearch({
    from: "/_admin/settings/vehicle-config/car-models/",
  })
  const {
    data: { data: carModels, error },
  } = useSuspenseQuery(createCarModelsListQueryOptions(search))

  useFetchEror(error)

  const columns = React.useMemo(() => getCarModelColumns(), [])

  const { mutate } = useCreateCarModel()

  const { table } = useDataTable({
    data: carModels,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "id", desc: true }],
      //   columnPinning: { right: ["actions"] },
      columnVisibility: {
        id: false,
      },
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <Can permission="config:vehicle_config:edit">
          <CarModelForm mode="create" onSubmit={(data) => mutate(data)} />
        </Can>
      </DataTableToolbar>
    </DataTable>
  )
}

export function CarModelTableSkeleton() {
  return <DataTableSkeleton columnCount={4} filterCount={1} shrinkZero />
}
