import { linkOptions } from "@tanstack/react-router"
import type { NotificationItem } from "./types"

/**
 * Where a notification leads. Invoices and quotations have their own page;
 * payments, trips and bookings open the list they appear in. A manual
 * notification is about nothing, so it leads nowhere.
 */
export function notificationLink(
  notification: Pick<NotificationItem, "resource_type" | "resource_id">
) {
  const { resource_type: type, resource_id: id } = notification
  if (!type) return null

  switch (type) {
    case "invoice":
      return id
        ? linkOptions({
            to: "/invoices/$invoiceId/view",
            params: { invoiceId: id },
          })
        : linkOptions({ to: "/invoices" })
    case "quotation":
      return id
        ? linkOptions({
            to: "/quotations/$quotationId/view",
            params: { quotationId: id },
          })
        : linkOptions({ to: "/quotations" })
    case "payment":
      return linkOptions({ to: "/payments" })
    case "trip":
      return linkOptions({ to: "/shipments/active" })
    case "booking":
      // A booking's trips start out waiting for a vehicle
      return linkOptions({ to: "/shipments/requests" })
    default:
      return null
  }
}
