"use client"

import { type ComponentProps, type ReactNode, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { LoadingSwap } from "@/components/ui/loading-swap"
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog"
import { Trash2Icon } from "lucide-react"

export function ActionButton({
  action,
  requireAreYouSure = false,
  areYouSureDescription = "This action cannot be undone.",
  ...props
}: ComponentProps<typeof Button> & {
  action: () => Promise<{ error: boolean; message?: string }>
  requireAreYouSure?: boolean
  areYouSureDescription?: ReactNode
}) {
  const [isLoading, startTransition] = useTransition()

  function performAction() {
    startTransition(async () => {
      const data = await action()
      if (data.error) toast.error(data.message ?? "Error")
    })
  }

  if (requireAreYouSure) {
    return (
      <AlertDialog open={isLoading ? true : undefined}>
        <AlertDialogTrigger asChild>
          <Button {...props} />
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {areYouSureDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant={'outline'}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={performAction} variant="destructive">
              <LoadingSwap isLoading={isLoading}>Delete</LoadingSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Button
      {...props}
      disabled={props.disabled ?? isLoading}
      onClick={(e) => {
        performAction()
        props.onClick?.(e)
      }}
    >
      <LoadingSwap
        isLoading={isLoading}
        className="inline-flex items-center gap-2"
      >
        {props.children}
      </LoadingSwap>
    </Button>
  )
}
