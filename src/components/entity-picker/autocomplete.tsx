import { useState, useMemo } from "react"
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

  // console.log("Value Data", value?.id, "triggerLoading", triggerLoading)

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

          <CommandList>
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
