import { Dispatch, SetStateAction } from "react"
import { BookingRouteTableRowAction } from "../types"
import { RouteEditForm } from "./route-edit-form"

type Props = {
  rowAction: BookingRouteTableRowAction | null
  setRowAction: Dispatch<SetStateAction<BookingRouteTableRowAction | null>>
}

export function BookingRouteTableActions({ rowAction, setRowAction }: Props) {
  const handleClose = () => setRowAction(null)
  return (
    <>
      <RouteEditForm
        key={rowAction?.row.original.id} // NOTE: required for re-creating the component every time a row is selected
        initialData={rowAction?.row.original}
        open={rowAction?.variant === "update"}
        onOpenChange={handleClose}
      />
    </>
  )
}
