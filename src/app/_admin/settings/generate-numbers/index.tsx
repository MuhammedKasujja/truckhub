import { EntityNumbersWrapper } from '@/features/settings/entity-numbers/components'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/settings/generate-numbers/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EntityNumbersWrapper/>
}
