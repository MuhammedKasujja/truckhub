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
import { EntityId } from "@/schemas"

export interface AutoCompleteProps<T> {
  id?: string
  options: T[]
  value?: T | EntityId | null // 👈 accept either
  loading?: boolean

  onChange: (value: T | null | undefined) => void

  /** remote search mode */
  onSearch?: (query: string) => void

  /** local filter mode */
  filterFn?: (option: T, query: string) => boolean

  getOptionValue: (option: T) => string

  renderOption: (option: T, selected: boolean) => React.ReactNode
  renderValue?: (option: T) => React.ReactNode

  label: string
  placeholder?: string
  className?: string
  disabled?: boolean
  clearable?: boolean

  noResultsMessage?: React.ReactNode

  /** Shown as a persistent row at the bottom of the list. Doesn't touch `value`/`onChange` —
   *  purely a UI hook for the caller to react to (e.g. navigate to a create page). */
  onCreateNew?: (search: string) => void
  createNewLabel?: (search: string) => React.ReactNode
}

export function AutoComplete<T>({
  id,
  options,
  value,
  loading = false,

  onChange,
  onSearch,
  filterFn,
  getOptionValue,
  renderOption,
  renderValue,

  label,
  placeholder = "Select...",
  disabled,
  clearable = true,
  noResultsMessage,

  onCreateNew,
  createNewLabel,
  className,
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

  // 👇 normalize `value` into a plain string key for comparisons
  const currentValueKey = useMemo(() => {
    if (value == null) return null
    return typeof value === "string" ? value : getOptionValue(value)
  }, [value, getOptionValue])

  // 👇 try to resolve the full option object, whether `value` was a string or T
  const selectedOption = useMemo(() => {
    if (value == null) return null
    if (typeof value !== "string") return value
    return options.find((opt) => getOptionValue(opt) === value) ?? null
  }, [value, options, getOptionValue])

  const isSelected = (option: T) => {
    if (currentValueKey == null) return false
    return getOptionValue(option) === currentValueKey
  }

  const handleSelect = (option: T) => {
    if (clearable && currentValueKey && isSelected(option)) {
      onChange(null)
    } else {
      onChange(option)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          {selectedOption
            ? (renderValue?.(selectedOption) ??
              renderOption(selectedOption, true))
            : currentValueKey
              ? currentValueKey // string id, not yet resolvable from `options` — caller's job to hydrate [[ Unknown Option ]]
              : placeholder}

          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${label.toLowerCase()}...`}
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
                {noResultsMessage ?? `No ${label.toLowerCase()} found.`}
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
