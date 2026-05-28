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
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

export function NavigationActions() {
  return (
    <div className="flex items-center gap-4">
      <NavigationButtons />
      <RefreshButton />
      <ThemeToggle />
      <ProfileDropdown />
    </div>
  )
}

function ProfileDropdown() {
  const router = useRouter()

  async function logoutUser() {
    await logoutFn()
    router.navigate({ to: "/login", replace: true })
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full grayscale">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>CN</AvatarFallback>
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

function NavigationButtons() {
  const { canGoBack, canGoForward, goBack, goForward, historyStack } =
    useNavigationHistory()

  return (
    <div className="flex flex-row gap-2">
      <Button size={"icon"} variant={"secondary"} onClick={goBack}>
        {historyStack.length}
      </Button>
      <Button
        size={"icon"}
        variant={"secondary"}
        className="h-7 w-7"
        asChild
        onClick={goBack}
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
      </Button>
      <Button
        size={"icon-sm"}
        variant={"secondary"}
        asChild
        onClick={goForward}
      >
        <ArrowRightIcon />
      </Button>
    </div>
  )
}
