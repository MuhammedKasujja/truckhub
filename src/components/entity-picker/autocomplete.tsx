import { useState, useMemo, useRef, useCallback, useEffect } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface AutoCompleteProps<T> {
  id?: string
  options: T[]
  value?: T | null
  loading?: boolean

  /** true while a selected value's id is being resolved upstream */
  triggerLoading?: boolean

  onChange: (value: T | null | undefined) => void

  /** remote search mode */
  onSearch?: (query: string) => void

  /** local filter mode */
  filterFn?: (option: T, query: string) => boolean

  getOptionValue: (option: T) => string
  renderOption: (option: T, selected: boolean) => React.ReactNode
  renderValue?: (option: T) => React.ReactNode

  /** Infinite scroll: fires when the sentinel at the bottom of the list
   *  scrolls into view (after the user has scrolled). */
  onLoadMore?: () => void
  loadingMore?: boolean
  hasMore?: boolean

  /** reports popover open/close (needed for fetchOnOpen upstream) */
  onOpenChange?: (open: boolean) => void

  onCreateNew?: (search: string) => void
  createNewLabel?: (search: string) => React.ReactNode

  label?: string
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  clearable?: boolean

  noResultsMessage?: React.ReactNode
}

export function AutoComplete<T>({
  id,
  options,
  value,
  loading = false,
  triggerLoading = false,
  onChange,
  onSearch,
  filterFn,
  onLoadMore,
  loadingMore = false,
  hasMore = false,
  onOpenChange,
  getOptionValue,
  renderOption,
  renderValue,
  onCreateNew,
  createNewLabel,
  label,
  placeholder = "Select...",
  searchPlaceholder,
  disabled,
  clearable = true,
  noResultsMessage,
}: AutoCompleteProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  // callback ref (state, not useRef) so the observer effect re-runs the
  // moment the portaled sentinel actually mounts
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null)

  // plain mutable flag, not attached to any element
  const userScrolledRef = useRef(false)

  const filteredOptions = useMemo(() => {
    if (onSearch) return options // remote mode: server already filtered
    if (filterFn && search) {
      return options.filter((opt) => filterFn(opt, search))
    }
    return options
  }, [options, search, filterFn, onSearch])

  const isSelected = (option: T) => {
    if (!value) return false
    return getOptionValue(option) === getOptionValue(value)
  }

  const handleSelect = (option: T) => {
    if (clearable && value && isSelected(option)) {
      onChange(null)
    } else {
      onChange(option)
    }
    setOpen(false)
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
  }

  const handleLoadMore = useCallback(() => {
    if (onLoadMore && hasMore && !loadingMore) {
      onLoadMore()
    }
  }, [onLoadMore, hasMore, loadingMore])

  // reset the scroll flag each time the popover opens/closes.
  // Declared BEFORE the observer effect so it runs first.
  useEffect(() => {
    userScrolledRef.current = false
  }, [open])

  useEffect(() => {
    if (!open || !onLoadMore || !sentinelEl) return

    // cmdk's list element is the scroll container; finding it from the
    // sentinel doesn't depend on CommandList forwarding a ref
    const root = sentinelEl.closest<HTMLElement>("[cmdk-list]")
    if (!root) return

    // an unbounded list can never clip the sentinel, so pages would
    // chain-load. Refuse and say why.
    const { overflowY } = getComputedStyle(root)
    if (overflowY !== "auto" && overflowY !== "scroll") {
      console.warn(
        "AutoComplete: [cmdk-list] needs max-height + overflow-y-auto for infinite scroll"
      )
      return
    }

    const markScrolled = () => {
      userScrolledRef.current = true
    }
    root.addEventListener("scroll", markScrolled, { passive: true })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return

        // overflowing list: wait for the user to scroll first (ignores the
        // initial report on observe). Non-overflowing list can't be
        // scrolled, so load more to fill it.
        const canScroll = root.scrollHeight > root.clientHeight + 1
        if (canScroll && !userScrolledRef.current) return

        handleLoadMore()
      },
      { root, rootMargin: "80px" }
    )

    observer.observe(sentinelEl)
    return () => {
      root.removeEventListener("scroll", markScrolled)
      observer.disconnect()
    }
  }, [open, onLoadMore, sentinelEl, handleLoadMore])

  const showTypeToSearchHint =
    !!onSearch && search.length === 0 && filteredOptions.length === 0

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between"
        >
          {value ? (
            (renderValue?.(value) ?? renderOption(value, true))
          ) : triggerLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading...
            </span>
          ) : (
            placeholder
          )}

          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            placeholder={
              searchPlaceholder ??
              (label ? `Search ${label.toLowerCase()}...` : "Search...")
            }
            value={search}
            onValueChange={(val) => {
              setSearch(val)
              onSearch?.(val)
            }}
          />

          <CommandList className="max-h-72 overflow-y-auto">
            {loading && (
              <div className="flex justify-center p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}

            {!loading && filteredOptions.length === 0 && (
              <CommandEmpty className="text-muted-foreground">
                {showTypeToSearchHint
                  ? "Type to search..."
                  : (noResultsMessage ??
                    (label
                      ? `No ${label.toLowerCase()} found.`
                      : "No data found."))}
              </CommandEmpty>
            )}

            <CommandGroup>
              {filteredOptions.map((option) => {
                const selected = isSelected(option)

                return (
                  <CommandItem
                    key={getOptionValue(option)}
                    value={getOptionValue(option)}
                    onSelect={() => handleSelect(option)}
                  >
                    {renderOption(option, selected)}

                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {/* sentinel: invisible scroll-position marker for the observer */}
            {onLoadMore && hasMore && (
              <div
                ref={setSentinelEl}
                className="h-px w-full"
                aria-hidden="true"
              />
            )}

            {loadingMore && (
              <div className="flex justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {onCreateNew && (
              <CommandGroup>
                <CommandItem
                  className="flex items-center justify-center bg-muted/60"
                  onSelect={() => {
                    onCreateNew(search)
                    setOpen(false)
                  }}
                >
                  {createNewLabel?.(search) ?? `+ Create "${search || "new"}"`}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
