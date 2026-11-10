import { useEffect, useState } from "react"
import { SpecialZoomLevel } from "@react-pdf-viewer/core"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  EllipsisIcon,
  Maximize2Icon,
  Minimize2Icon,
  MinusIcon,
  PlusIcon,
  PrinterIcon,
  RefreshCwIcon,
} from "lucide-react"
import type { ComponentProps, ComponentType, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type ZoomLevel = number | SpecialZoomLevel

/** Steps used by zoom in / zoom out. */
export const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]
const ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export const MOD_KEY =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.userAgent)
    ? "⌘"
    : "Ctrl"

export function zoomLabel(level: ZoomLevel, scale: number) {
  if (level === SpecialZoomLevel.PageWidth) return "Fit width"
  if (level === SpecialZoomLevel.PageFit) return "Fit page"
  return `${Math.round(scale * 100)}%`
}

export type PdfToolbarProps = {
  start?: ReactNode
  /** No document is showing yet, so actions on it can't run. */
  disabled: boolean
  /** Zero-based. */
  currentPage: number
  numPages: number
  onJumpToPage: (pageIndex: number) => void
  zoomLevel: ZoomLevel
  scale: number
  onZoomTo: (level: ZoomLevel) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
  onPrint: () => void
  onDownload: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

export function PdfToolbar({
  start,
  disabled,
  currentPage,
  numPages,
  onJumpToPage,
  zoomLevel,
  scale,
  onZoomTo,
  onZoomIn,
  onZoomOut,
  onRefresh,
  isRefreshing,
  onPrint,
  onDownload,
  isFullscreen,
  onToggleFullscreen,
}: PdfToolbarProps) {
  const FullscreenIcon = isFullscreen ? Minimize2Icon : Maximize2Icon
  const fullscreenLabel = isFullscreen ? "Exit full screen" : "Full screen"

  return (
    <>
      {start}

      <PageNavigation
        disabled={disabled}
        currentPage={currentPage}
        numPages={numPages}
        onJumpToPage={onJumpToPage}
      />

      <div className="ml-auto flex items-center gap-1">
        <ButtonGroup aria-label="Zoom">
          <ToolbarIconButton
            label="Zoom out"
            shortcut={`${MOD_KEY} −`}
            icon={MinusIcon}
            disabled={disabled || scale <= ZOOM_STEPS[0]}
            onClick={onZoomOut}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                className="min-w-24 justify-between tabular-nums"
                aria-label="Zoom level"
              >
                {zoomLabel(zoomLevel, scale)}
                <ChevronDownIcon className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40">
              <ZoomMenuItem
                active={zoomLevel === SpecialZoomLevel.PageWidth}
                onSelect={() => onZoomTo(SpecialZoomLevel.PageWidth)}
                shortcut={`${MOD_KEY} 0`}
              >
                Fit width
              </ZoomMenuItem>
              <ZoomMenuItem
                active={zoomLevel === SpecialZoomLevel.PageFit}
                onSelect={() => onZoomTo(SpecialZoomLevel.PageFit)}
              >
                Fit page
              </ZoomMenuItem>
              <DropdownMenuSeparator />
              {ZOOM_PRESETS.map((preset) => (
                <ZoomMenuItem
                  key={preset}
                  active={zoomLevel === preset}
                  onSelect={() => onZoomTo(preset)}
                >
                  {preset * 100}%
                </ZoomMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ToolbarIconButton
            label="Zoom in"
            shortcut={`${MOD_KEY} +`}
            icon={PlusIcon}
            disabled={disabled || scale >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
            onClick={onZoomIn}
          />
        </ButtonGroup>

        <Separator orientation="vertical" className="mx-1 h-5! self-center" />

        {/* Secondary actions: inline on wider screens, in a menu on phones. */}
        <div className="hidden items-center gap-1 sm:flex">
          {onRefresh && (
            <ToolbarIconButton
              label="Regenerate"
              icon={RefreshCwIcon}
              iconClassName={cn(isRefreshing && "animate-spin")}
              disabled={isRefreshing}
              onClick={onRefresh}
            />
          )}
          <ToolbarIconButton
            label="Print"
            shortcut={`${MOD_KEY} P`}
            icon={PrinterIcon}
            disabled={disabled}
            onClick={onPrint}
          />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={onDownload}
            >
              <DownloadIcon data-icon="inline-start" />
              <span className="hidden sm:inline">Download</span>
              <span className="sr-only sm:hidden">Download</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Download PDF <Kbd>{MOD_KEY} S</Kbd>
          </TooltipContent>
        </Tooltip>

        <ToolbarIconButton
          label={fullscreenLabel}
          shortcut="F"
          icon={FullscreenIcon}
          className="hidden sm:inline-flex"
          onClick={onToggleFullscreen}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="sm:hidden"
              aria-label="More actions"
            >
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {onRefresh && (
              <DropdownMenuItem disabled={isRefreshing} onSelect={onRefresh}>
                <RefreshCwIcon />
                Regenerate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem disabled={disabled} onSelect={onPrint}>
              <PrinterIcon />
              Print
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onToggleFullscreen}>
              <FullscreenIcon />
              {fullscreenLabel}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

function PageNavigation({
  disabled,
  currentPage,
  numPages,
  onJumpToPage,
}: Pick<
  PdfToolbarProps,
  "disabled" | "currentPage" | "numPages" | "onJumpToPage"
>) {
  const [draft, setDraft] = useState(String(currentPage + 1))

  // Follow the page the reader scrolls to.
  useEffect(() => setDraft(String(currentPage + 1)), [currentPage])

  function commit() {
    const page = Number.parseInt(draft, 10)
    if (Number.isNaN(page)) return setDraft(String(currentPage + 1))
    const index = Math.min(Math.max(page, 1), numPages) - 1
    setDraft(String(index + 1))
    if (index !== currentPage) onJumpToPage(index)
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <ToolbarIconButton
        label="Previous page"
        icon={ChevronLeftIcon}
        disabled={disabled || currentPage <= 0}
        onClick={() => onJumpToPage(currentPage - 1)}
      />
      <div className="flex items-center gap-1.5 tabular-nums">
        <input
          aria-label="Page number"
          inputMode="numeric"
          disabled={disabled}
          value={disabled ? "–" : draft}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commit()
            }
          }}
          className="h-7 w-9 rounded-md border bg-background text-center text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        />
        <span className="text-muted-foreground">
          / {disabled ? "–" : numPages}
        </span>
      </div>
      <ToolbarIconButton
        label="Next page"
        icon={ChevronRightIcon}
        disabled={disabled || currentPage >= numPages - 1}
        onClick={() => onJumpToPage(currentPage + 1)}
      />
    </div>
  )
}

function ToolbarIconButton({
  label,
  shortcut,
  icon: Icon,
  iconClassName,
  ...props
}: Omit<ComponentProps<typeof Button>, "children"> & {
  label: string
  shortcut?: string
  icon: ComponentType<{ className?: string }>
  iconClassName?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} {...props}>
          <Icon className={iconClassName} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {shortcut && <Kbd>{shortcut}</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

function ZoomMenuItem({
  active,
  shortcut,
  children,
  onSelect,
}: {
  active: boolean
  shortcut?: string
  children: ReactNode
  onSelect: () => void
}) {
  return (
    <DropdownMenuItem
      onSelect={onSelect}
      className={cn(active && "bg-primary/10 font-medium text-primary")}
    >
      {children}
      {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
    </DropdownMenuItem>
  )
}
