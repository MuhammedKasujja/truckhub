import { Link } from "@tanstack/react-router"
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
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { useAuth } from "@/components/providers/auth-context"
import { generateAvatorFallback } from "@/lib/format"
import { useServerFn } from "@tanstack/react-start"
import { NotificationDropdown } from "./notifications-dropdown"

export function NavigationActions() {
  return (
    <div className="flex items-center gap-4">
      <RefreshButton />
      <NotificationDropdown />
      <ThemeToggle />
      <ProfileDropdown />
    </div>
  )
}

function ProfileDropdown() {
  const { user } = useAuth()
  const logout = useServerFn(logoutFn)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full grayscale">
          <Avatar>
            <AvatarImage src={user?.photo_url} alt={user?.name} />
            <AvatarFallback>
              {generateAvatorFallback(user?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/settings/user-profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link to="/settings/company-details">Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={() => logout()}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function NavigationButtons() {
  const { canGoBack, canGoForward, goBack, goForward } = useNavigationHistory()

  return (
    <div className="flex flex-row gap-2">
      <Button
        size={"icon-xs"}
        variant={"secondary"}
        disabled={!canGoBack}
        onClick={goBack}
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
      </Button>
      <Button
        size={"icon-xs"}
        variant={"secondary"}
        disabled={!canGoForward}
        onClick={goForward}
      >
        <ArrowRightIcon />
      </Button>
    </div>
  )
}
