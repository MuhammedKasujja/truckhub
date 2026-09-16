import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { createFileRoute } from "@tanstack/react-router"
import { Cloud } from "lucide-react"

export const Route = createFileRoute("/_admin/reports/invoices/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Empty className="min-h-screen border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Cloud />
        </EmptyMedia>
        <EmptyTitle className="text-3xl">Reports</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription className="flex flex-col items-center justify-center gap-4">
          Comming soon.......
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  )
}
