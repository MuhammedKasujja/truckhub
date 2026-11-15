import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { IdCardIcon, UserPlus } from "lucide-react"
import { staffListQueryOptions } from "../query-options"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/features/auth/hooks/use-permissions"

type Props = { userId: string } | { driverId: string }

/**
 * On a user's or driver's page: a link to their staff record, or a button to
 * create one from them. Shows nothing to people who can't see staff.
 */
export function StaffLink(props: Props) {
  const { hasPermission } = usePermissions()
  const canView = hasPermission("hr:staff:view")
  const link =
    "userId" in props
      ? { user_id: props.userId }
      : { driver_id: props.driverId }

  const { data, isLoading, error } = useQuery({
    ...staffListQueryOptions({ page: 1, perPage: 10, search: "", ...link }),
    enabled: canView,
  })

  // Without a definite answer, offering "create" could lead to a duplicate.
  if (!canView || isLoading || error || !data) return null

  const staff = data.data.at(0)
  if (staff) {
    return (
      <Button variant="outline" asChild>
        <Link to="/hr/staff/$staffId/view" params={{ staffId: staff.id }}>
          <IdCardIcon />
          Staff record
        </Link>
      </Button>
    )
  }

  if (!hasPermission("hr:staff:create")) return null
  return (
    <Button variant="outline" asChild>
      <Link
        to="/hr/staff/new"
        search={
          "userId" in props
            ? { from_user: props.userId }
            : { from_driver: props.driverId }
        }
      >
        <UserPlus />
        Create staff record
      </Link>
    </Button>
  )
}
