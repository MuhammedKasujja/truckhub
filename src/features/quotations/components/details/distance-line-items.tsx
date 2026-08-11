import { formatMoney } from "@/lib/format"
import { DistanceLineItem } from "../../types"

type DistanceLineItemListItemProps = {
  lineItem: DistanceLineItem
}

export function DistanceLineItemListItem({
  lineItem,
}: DistanceLineItemListItemProps) {
  return (
    <div>
      <div>Require Driver: {lineItem.with_driver ? "Yes" : "No"}</div>
      <div>Need Loaders: {lineItem.with_loaders ? "Yes" : "No"}</div>
      <div>Hire mode: {lineItem.engine_mode}</div>
      <div>Price: {formatMoney(lineItem.unit_price)}</div>
      <div>Quantity: {lineItem.quantity}</div>
      <div>Subtotal: {formatMoney(lineItem.subtotal)}</div>
      <div>Total: {formatMoney(lineItem.line_total)}</div>
    </div>
  )
}
