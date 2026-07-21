import { useEffect, useRef, useState } from "react"
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
  const remainingRef = useRef(countdownSeconds)

  useEffect(() => {
    if (!open) return
    setRemaining(countdownSeconds)
    remainingRef.current = countdownSeconds

    let interval = setInterval(() => {
      remainingRef.current = Math.max(0, remainingRef.current - 1)
      setRemaining(remainingRef.current)

      if (remainingRef.current <= 0) {
        clearInterval(interval)
        // defer logout to avoid triggering state updates during render
        setTimeout(() => onLogoutNow(), 0)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [open, countdownSeconds, onLogoutNow])

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
