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
    setRemaining(countdownSeconds)

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onLogoutNow() // ← fires logout when counter hits 0
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [open, countdownSeconds])

  if (!open) return null

  return (
    <AlertDialog open={open}>
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
          <AlertDialogAction onClick={onLogoutNow} variant={'destructive'}>
            Logout now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
