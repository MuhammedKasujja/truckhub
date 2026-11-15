import type { EntityId } from "@/schemas"

export type NotificationSource =
  | "invoice_created"
  | "invoice_emailed"
  | "quotation_accepted"
  | "quotation_emailed"
  | "quotation_rejected"
  | "payment_recorded"
  | "trip_created"
  | "trip_started"
  | "trip_ended"

/** What a notification is about, when a business event raised it. */
export type NotificationResourceType =
  | "invoice"
  | "quotation"
  | "payment"
  | "trip"
  | "booking"

export type NotificationItem = {
  /** The recipient row: the id used to mark the notification read. */
  id: EntityId
  notification_id: EntityId
  title: string
  body: string
  created_at: string
  source: NotificationSource
  is_read: boolean
  read_at: string | null
  resource_type: NotificationResourceType | (string & {}) | null
  resource_id: EntityId | null
}
