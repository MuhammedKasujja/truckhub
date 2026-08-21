import { EntityId } from "@/schemas"

type NotificationSource =
  | "invoice_created"
  | "invoice_emailed"
  | "quotation_accepted"
  | "quotation_emailed"
  | "quotation_rejected"
  | "payment_recorded"
  | "trip_created"
  | "trip_started"
  | "trip_ended"

export type NotificationItem = {
  id: number
  notification_id: EntityId
  title: string
  body: string
  created_at: string
  source: NotificationSource
  is_read: boolean
  read_at: string | null
}
