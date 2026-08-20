import { EntityId } from "@/schemas"

export type NotificationItem = {
  id: number
  notification_id: EntityId
  title: string
  body: string
  created_at: string
  is_read: boolean
  read_at: string | null
}
