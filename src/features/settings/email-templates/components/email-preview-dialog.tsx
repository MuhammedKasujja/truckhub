import type { RenderedEmail } from "../types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  email?: RenderedEmail
  isLoading?: boolean
}

/** The email as it will be sent, rendered with sample values. */
export function EmailPreviewDialog({ open, onOpenChange, email, isLoading }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-4 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>
            Rendered with sample values, inside the layout every email uses.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !email ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-[50vh] w-full" />
          </div>
        ) : (
          <>
            <p className="text-sm">
              <span className="text-muted-foreground">Subject: </span>
              <span className="font-medium">{email.subject}</span>
            </p>
            {/* Empty sandbox: the HTML can't run scripts or reach the app */}
            <iframe
              title="Email preview"
              sandbox=""
              srcDoc={email.html}
              className="h-[60vh] w-full rounded-md border bg-white"
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
