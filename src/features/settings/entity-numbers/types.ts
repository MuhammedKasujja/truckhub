import { EntityWithPatterns } from "@/common/constants"

export type EntityNumberPattern = {
  id: number
  entity_name: EntityWithPatterns
  pattern: string
  counter_padding: number
  last_number: number
}
