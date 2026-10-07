import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SessionIdleWarningDialogProps {
  open: boolean
  /** Seconds to count down from — should match (timeout - promptTimeout) / 1000 */
  countdownSeconds: number
  onStayLoggedIn: () => void
  onLogoutNow: () => void
}

export function SessionIdleWarningDialog({
  open,
  countdownSeconds,
  onLogoutNow,
  onStayLoggedIn,
}: SessionIdleWarningDialogProps) {
  const [remaining, setRemaining] = useState(countdownSeconds)

  useEffect(() => {
    if (!open) return

    const deadline = Date.now() + countdownSeconds * 1000
    const tick = () =>
      setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))

    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [open, countdownSeconds])

  if (!open) return null

  return (
    <AlertDialog
      open={open}
      // Fires on outside tap/click and Escape. It does NOT fire when the
      // parent sets `open` to false, so there's no loop.
      onOpenChange={(next) => {
        if (!next) onStayLoggedIn()
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Still there?</AlertDialogTitle>
          <AlertDialogDescription>
            Logging out in{" "}
            <span className="font-medium text-foreground">{remaining}</span>{" "}
            seconds
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStayLoggedIn}>
            Stay Logged-in
          </AlertDialogCancel>
          <AlertDialogAction onClick={onLogoutNow} variant={"destructive"}>
            Logout now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
