import { useEffect, useRef, useState } from "react"
import { SpecialZoomLevel, Viewer, Worker } from "@react-pdf-viewer/core"
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation"
import { printPlugin } from "@react-pdf-viewer/print"
import { zoomPlugin } from "@react-pdf-viewer/zoom"
import { FileWarningIcon, Loader2Icon, RefreshCwIcon } from "lucide-react"
import { PdfFrame, PdfPaperSkeleton } from "./pdf-frame"
import { PdfToolbar, ZOOM_STEPS } from "./pdf-toolbar"
import type { KeyboardEvent } from "react"
import type { ZoomLevel } from "./pdf-toolbar"
import type { PdfFile, PdfViewerProps } from "./index"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import "@react-pdf-viewer/core/lib/styles/index.css"
import "./pdf-viewer.css"

export default function PdfViewLoader({
  file,
  fileName,
  toolbarStart,
  onRefresh,
  isLoading = false,
  error,
  className,
}: PdfViewerProps) {
  const frameRef = useRef<HTMLDivElement>(null)

  // The plugin factories call hooks, so they run on every render.
  const zoom = zoomPlugin({ enableShortcuts: false })
  const pageNavigation = pageNavigationPlugin({ enableShortcuts: false })
  const print = printPlugin({ enableShortcuts: false })

  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  // What the reader asked for (kept across documents) and the scale it
  // works out to for the current document.
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(
    SpecialZoomLevel.PageWidth
  )
  const [scale, setScale] = useState(1)
  const isFullscreen = useIsFullscreen(frameRef)

  const showError = Boolean(error) && !isLoading && !file
  const disabled = !file || numPages === 0

  // A new file starts unloaded until the viewer reports its pages.
  const [loadedFile, setLoadedFile] = useState(file)
  if (loadedFile !== file) {
    setLoadedFile(file)
    setNumPages(0)
    setCurrentPage(0)
  }

  function zoomTo(level: ZoomLevel) {
    setZoomLevel(level)
    zoom.zoomTo(level)
  }

  function step(direction: 1 | -1) {
    const next =
      direction === 1
        ? ZOOM_STEPS.find((s) => s > scale + 0.001)
        : [...ZOOM_STEPS].reverse().find((s) => s < scale - 0.001)
    if (next !== undefined) zoomTo(next)
  }

  function jumpToPage(index: number) {
    if (index < 0 || index >= numPages) return
    pageNavigation.jumpToPage(index)
  }

  function download() {
    if (file) downloadPdf(file, fileName)
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void frameRef.current?.requestFullscreen()
  }

  // Shortcuts work while focus is anywhere inside the viewer.
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const mod = e.metaKey || e.ctrlKey
    if (e.altKey) return

    if (!mod) {
      const typing = (e.target as HTMLElement).closest(
        "input, textarea, [contenteditable=true]"
      )
      if (!typing && !e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault()
        toggleFullscreen()
      }
      return
    }

    if (disabled) return
    const actions: Partial<Record<string, () => void>> = {
      "=": () => step(1),
      "+": () => step(1),
      "-": () => step(-1),
      "0": () => zoomTo(SpecialZoomLevel.PageWidth),
      s: download,
      p: print.print,
    }
    const action = actions[e.key.toLowerCase()]
    if (action) {
      e.preventDefault()
      action()
    }
  }

  return (
    <PdfFrame
      ref={frameRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={className}
      toolbar={
        <PdfToolbar
          start={toolbarStart}
          disabled={disabled}
          currentPage={currentPage}
          numPages={numPages}
          onJumpToPage={jumpToPage}
          zoomLevel={zoomLevel}
          scale={scale}
          onZoomTo={zoomTo}
          onZoomIn={() => step(1)}
          onZoomOut={() => step(-1)}
          onRefresh={onRefresh}
          isRefreshing={isLoading}
          onPrint={print.print}
          onDownload={download}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      }
    >
      {showError ? (
        <PdfError onRetry={onRefresh} />
      ) : !file ? (
        <PdfPaperSkeleton />
      ) : (
        <>
          <Worker workerUrl="/pdf.worker.min.js">
            <Viewer
              fileUrl={file}
              plugins={[zoom, pageNavigation, print]}
              theme="light"
              defaultScale={zoomLevel}
              renderLoader={() => <PdfPaperSkeleton />}
              // pdf.js hands the bytes to its worker, which empties the
              // array. Give it a copy so the cached file stays usable.
              transformGetDocumentParams={(params) => ({
                ...params,
                data:
                  params.data instanceof Uint8Array
                    ? params.data.slice()
                    : params.data,
              })}
              onDocumentLoad={(e) => {
                setNumPages(e.doc.numPages)
                setCurrentPage(0)
              }}
              onPageChange={(e) => setCurrentPage(e.currentPage)}
              onZoom={(e) => setScale(e.scale)}
            />
          </Worker>
          {isLoading && (
            <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
              <span className="flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
                <Loader2Icon className="size-3.5 animate-spin" />
                Regenerating…
              </span>
            </div>
          )}
        </>
      )}
    </PdfFrame>
  )
}

function PdfError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileWarningIcon />
        </EmptyMedia>
        <EmptyTitle>Couldn't generate this PDF</EmptyTitle>
        <EmptyDescription>
          The server didn't return a document. Try again in a moment.
        </EmptyDescription>
      </EmptyHeader>
      {onRetry && (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCwIcon data-icon="inline-start" />
            Try again
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}

function useIsFullscreen(ref: React.RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  useEffect(() => {
    const update = () =>
      setIsFullscreen(
        document.fullscreenElement !== null &&
          document.fullscreenElement === ref.current
      )
    document.addEventListener("fullscreenchange", update)
    return () => document.removeEventListener("fullscreenchange", update)
  }, [ref])
  return isFullscreen
}

function downloadPdf(file: PdfFile, fileName: string) {
  const href =
    typeof file === "string"
      ? file
      : URL.createObjectURL(
          new Blob([file.slice()], { type: "application/pdf" })
        )
  const link = document.createElement("a")
  link.href = href
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  if (typeof file !== "string") {
    setTimeout(() => URL.revokeObjectURL(href), 0)
  }
}
