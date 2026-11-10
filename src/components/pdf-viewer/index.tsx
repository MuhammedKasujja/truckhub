import { Suspense, lazy } from "react"
import { ClientOnly } from "@tanstack/react-router"
import { PdfFrame, PdfPaperSkeleton, PdfToolbarSkeleton } from "./pdf-frame"
import type { ReactNode } from "react"

const PdfViewLoader = lazy(() => import("./pdf-view-loader"))

export type PdfFile = string | Uint8Array

export type PdfViewerProps = {
  /** The PDF bytes or a URL. Empty while it is being fetched. */
  file: PdfFile | null | undefined
  /** Name used when the reader downloads the file. */
  fileName: string
  /** Shown at the start of the toolbar, e.g. a document picker. */
  toolbarStart?: ReactNode
  /** Fetch the PDF again. Also used by the error state's retry button. */
  onRefresh?: () => void
  /** A fetch is in flight (first load or a refresh). */
  isLoading?: boolean
  error?: unknown
  className?: string
}

/**
 * PDF viewer with the app's own toolbar: page navigation, zoom, print,
 * download and full screen. pdf.js only runs in the browser, so it loads
 * lazily on the client.
 */
export function PdfViewer(props: PdfViewerProps) {
  const fallback = (
    <PdfFrame
      className={props.className}
      toolbar={<PdfToolbarSkeleton start={props.toolbarStart} />}
    >
      <PdfPaperSkeleton />
    </PdfFrame>
  )

  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <PdfViewLoader {...props} />
      </Suspense>
    </ClientOnly>
  )
}
