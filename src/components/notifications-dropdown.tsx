import { BellIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/features/notifications/hooks/use-notifications"
import { useAuth } from "./providers/auth-context"
import { formatDateTime } from "@/lib/format"

export function NotificationDropdown() {
  const { user } = useAuth()
  const { unreadCount, notifications, markAllRead } = useNotifications(user?.id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />

          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 py-0 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button> */}
        <Button
          type="button"
          className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
          aria-label="Notifications"
          size={"icon-sm"}
          variant={"ghost"}
        >
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            // <span className="text-destructive-foreground absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs">
            //   {unreadCount > 99 ? "99+" : unreadCount}
            // </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3">
          <p className="text-sm font-semibold">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 rounded-lg bg-secondary px-2 py-0.5 text-xs font-normal text-secondary-foreground">
                {unreadCount} new
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

        {/* List */}
        <ScrollArea className="h-72">
          <div className="flex flex-col">
            {notifications.map((n) => (
              <button
                key={n.id}
                className={cn(
                  "border-b px-3 py-2 text-left transition hover:bg-muted",
                  n.is_read && "bg-muted/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{n.title}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDateTime(n.created_at)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">{n.body}</p>
              </button>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {/* Footer */}
        <div className="p-2">
          <Button variant="ghost" className="w-full">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
