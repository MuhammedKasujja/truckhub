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

  /** true while a selected value's id is being resolved to a full object upstream —
   *  shows a spinner in the trigger instead of the placeholder. */
  triggerLoading?: boolean

  onChange: (value: T | null | undefined) => void

  /** remote search mode */
  onSearch?: (query: string) => void

  /** local filter mode */
  filterFn?: (option: T, query: string) => boolean

  getOptionValue: (option: T) => string

  renderOption: (option: T, selected: boolean) => React.ReactNode
  renderValue?: (option: T) => React.ReactNode

  /** Infinite scroll: called automatically when the sentinel at the bottom
   *  of the list scrolls into view. Omit (or leave hasMore falsy) to disable. */
  onLoadMore?: () => void
  loadingMore?: boolean
  hasMore?: boolean

  /** shown as a persistent row at the bottom of the list; purely a UI hook,
   *  doesn't touch value/onChange itself */
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

  // scroll container for the IntersectionObserver's `root` — cmdk's
  // CommandList renders the actual scrollable element, so we watch it
  // directly rather than the viewport (the popover content may otherwise
  // never fully leave the viewport, and the observer would never fire).
  const listRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filteredOptions = useMemo(() => {
    // Remote mode (React Query / API)
    if (onSearch) return options

    // Local filter mode
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

  // stable callback so the observer effect doesn't need to reattach every
  // render just because a new closure was created
  const handleLoadMore = useCallback(() => {
    if (onLoadMore && hasMore && !loadingMore) {
      onLoadMore()
    }
  }, [onLoadMore, hasMore, loadingMore])

  useEffect(() => {
    if (!open || !onLoadMore) return
    const sentinel = sentinelRef.current
    const root = listRef.current
    if (!sentinel || !root) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore()
        }
      },
      { root, rootMargin: "80px" } // fire a bit before it's fully visible
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
    // re-attach when the popover opens, or when the option list length
    // changes (sentinel position moves — some observer implementations need
    // a fresh observe call after layout shifts this significantly)
  }, [open, onLoadMore, handleLoadMore, filteredOptions.length])

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
            placeholder={
              (searchPlaceholder ?? label)
                ? `Search ${label?.toLowerCase()}...`
                : "Search...."
            }
            value={search}
            onValueChange={(val) => {
              setSearch(val)
              onSearch?.(val) // 🔥 remote mode trigger
            }}
          />

          <CommandList ref={listRef} className="max-h-72 overflow-y-auto">
            {loading && (
              <div className="flex justify-center p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}

            {!loading && filteredOptions.length === 0 && (
              <CommandEmpty className="text-muted-foreground">
                {(noResultsMessage ?? label)
                  ? `No ${label?.toLowerCase()} found.`
                  : "No data found."}
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

            {/* sentinel — invisible, purely a scroll-position marker for the observer */}
            {onLoadMore && hasMore && (
              <div
                ref={sentinelRef}
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
