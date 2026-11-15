import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { BellOffIcon, CheckCheckIcon } from "lucide-react"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotificationsContext } from "@/components/providers/notifications/notification-context"
import { NotificationRow } from "@/features/notifications/components/notification-row"
import { useNotificationList } from "@/features/notifications/hooks/use-notifications"

export const Route = createFileRoute("/_admin/notifications/")({
  component: RouteComponent,
})

type Filter = "all" | "unread"

function RouteComponent() {
  const [filter, setFilter] = useState<Filter>("all")
  const { userId, unreadCount, markRead, markAllRead } =
    useNotificationsContext()
  const {
    notifications,
    total,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useNotificationList(userId, filter === "unread")

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader>
        <PageTitle>Notifications</PageTitle>
        <PageAction>
          <Button
            type="button"
            variant="outline"
            disabled={unreadCount === 0}
            onClick={() => markAllRead()}
          >
            <CheckCheckIcon />
            Mark all read
          </Button>
        </PageAction>
      </PageHeader>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <BellOffIcon className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {filter === "unread"
                ? "You have read everything."
                : "No notifications yet."}
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onRead={markRead}
              className="px-4 py-3"
            />
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {notifications.length} of {total}
          </span>
          {hasNextPage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
