"use client"
import { useRouter } from "@tanstack/react-router"
import { ThemeToggle } from "./theme/toggler"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { logoutFn } from "@/features/auth/services"
import { RefreshButton } from "./refresh-button"
import { useNavigationHistory } from "@/hooks/use-navigation-history"
import { ArrowLeftIcon, ArrowRightIcon, BellIcon } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { generateAvatorFallback } from "@/lib/format"

export function NavigationActions() {
  return (
    <div className="flex items-center gap-4">
      <RefreshButton />
      <NotificationBell />
      <ThemeToggle />
      <ProfileDropdown />
    </div>
  )
}

function ProfileDropdown() {
  const router = useRouter()

  const { user } = useAuth()

  async function logoutUser() {
    await logoutFn()
    router.navigate({ to: "/login", replace: true })
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full grayscale">
          <Avatar>
            <AvatarImage src={user.photo_url} alt={user.name} />
            <AvatarFallback>{generateAvatorFallback(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={logoutUser}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function NavigationButtons() {
  const { canGoBack, canGoForward, goBack, goForward, historyStack } =
    useNavigationHistory()

  return (
    <div className="flex flex-row gap-2">
      {/* <Button size={"icon-xs"} variant={"secondary"} onClick={goBack}>
        {historyStack.length}
      </Button> */}
      <Button size={"icon-xs"} variant={"secondary"} onClick={goBack}>
        <ArrowLeftIcon className="h-3.5 w-3.5" />
      </Button>
      <Button size={"icon-xs"} variant={"secondary"} onClick={goForward}>
        <ArrowRightIcon />
      </Button>
    </div>
  )
}

function NotificationBell() {
  const unreadCount = 3

  return (
    <button
      type="button"
      className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
      aria-label="Notifications"
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
    </button>
  )
}
