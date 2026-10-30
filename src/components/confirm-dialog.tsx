import { ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { ActionIcon } from "./icons"
import { LoadingSwap } from "./ui/loading-swap"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
  title?: ReactNode
  description?: ReactNode
  confirmLabel?: ReactNode
  children?: ReactNode // optional slot for a trigger
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isLoading && !next) return // block dismiss while pending
        onOpenChange(next)
      }}
    >
      {children}
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <ActionIcon action="delete" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isLoading}
            onClick={onConfirm}
          >
            <LoadingSwap isLoading={isLoading}>{confirmLabel}</LoadingSwap>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
