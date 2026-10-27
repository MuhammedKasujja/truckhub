import { formatDate } from "@/lib/format"
import { type Shipment } from "@/features/shipments/types"

export const toDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

export const formatRange = (event?: Shipment) => {
  if (event === undefined) return ""
  return `${formatDate(event.item.scheduled_start)} – ${formatDate(event.item.scheduled_end)}`
}

/** The compact time a month cell has room for: `9a`, `9:15a`, `4:30p`. */
export const compactTime = (value: Date) => {
  const hours = value.getHours()
  const minutes = value.getMinutes()
  const suffix = hours >= 12 ? "p" : "a"
  const display = hours % 12 === 0 ? 12 : hours % 12
  return minutes === 0
    ? `${display}${suffix}`
    : `${display}:${String(minutes).padStart(2, "0")}${suffix}`
}
