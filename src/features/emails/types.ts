import type { EntityId } from "@/schemas"

/** The records a composer was opened from: they prefill recipients and attachments. */
export type ComposeContext = {
  invoiceId?: EntityId
  quotationId?: EntityId
  tripId?: EntityId
  clientId?: EntityId
}

export type ComposeEmailResult = {
  status: string
  task_id: string
}
