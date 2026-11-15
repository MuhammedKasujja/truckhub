import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { BellIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useNotificationsContext } from "@/components/providers/notifications/notification-context"
import { NotificationRow } from "@/features/notifications/components/notification-row"

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const { unreadCount, notifications, isLoading, markRead, markAllRead } =
    useNotificationsContext()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          size={"icon-sm"}
          variant={"ghost"}
        >
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3">
          <p className="text-sm font-semibold">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 rounded-lg bg-secondary px-2 py-0.5 text-xs font-normal text-secondary-foreground">
                {unreadCount > 99 ? "99+" : unreadCount} new
              </span>
            )}
          </p>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => markAllRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
        <Separator />

        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              {isLoading ? "Loading…" : "No notifications yet."}
            </p>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onRead={markRead}
                  onOpen={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />

        <div className="p-2">
          <Button variant="ghost" className="w-full" asChild>
            <Link to="/notifications" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
