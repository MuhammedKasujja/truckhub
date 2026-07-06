import { useState, useEffect, useMemo } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { useNavigate, useSearch, useRouter } from "@tanstack/react-router"
import {
  useController,
  type FieldValues,
  type FieldPath,
  type Control,
} from "react-hook-form"
import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { RequiredLabelIcon } from "@/components/required-label-icon"

export interface EntityPickerConfig<T> {
  entityName: string // "client" | "vehicle" — used for query keys & created_* param
  label: string // "Client" | "Vehicle" — used for placeholder/empty text
  getOptionValue: (item: T) => string
  renderOption: (item: T, selected: boolean) => React.ReactNode
  renderValue?: (item: T) => React.ReactNode
  fetchById: (id: string) => Promise<T>
  search: (query: string) => Promise<T[]>
  createRoute?: string // if provided → "page" create flow; if omitted → "dialog"
  CreateForm?: React.ComponentType<{
    prefill: string
    onCreated: (item: T) => void
    submitting?: boolean
  }>
  createMutation?: (data: any) => Promise<T>
}

export interface PickerProps<T> {
  value: T | string | null
  onChange: (value: T | null | undefined) => void
  disabled?: boolean
}

export function createEntityPicker<T>(config: EntityPickerConfig<T>) {
  const {
    entityName,
    label,
    getOptionValue,
    renderOption,
    renderValue,
    fetchById,
    search: searchFn,
    createRoute,
    CreateForm,
    createMutation,
  } = config

  function usePickerState(
    value: T | string | null,
    onChange: (v: T | null | undefined) => void
  ) {
    const [search, setSearch] = useState("")
    const queryClient = useQueryClient()

    const idToResolve = typeof value === "string" ? value : null

    const { data: resolved } = useQuery({
      queryKey: [entityName, idToResolve],
      queryFn: () => fetchById(idToResolve!),
      enabled: !!idToResolve,
      staleTime: 5 * 60 * 1000,
    })

    useEffect(() => {
      if (
        resolved &&
        typeof value === "string" &&
        value === getOptionValue(resolved)
      ) {
        onChange(resolved)
      }
    }, [resolved]) // eslint-disable-line react-hooks/exhaustive-deps

    const { data: searchResults = [], isFetching } = useQuery({
      queryKey: [entityName, "search", search],
      queryFn: () => searchFn(search),
      enabled: search.length > 0,
    })

    const mergedOptions = useMemo(() => {
      if (!resolved || search.length > 0) return searchResults
      const present = searchResults.some(
        (o) => getOptionValue(o) === getOptionValue(resolved)
      )
      return present ? searchResults : [resolved, ...searchResults]
    }, [searchResults, resolved, search])

    // ---- create flow (dialog OR page, unified via onCreated) ----
    const [dialogOpen, setDialogOpen] = useState(false)
    const [prefill, setPrefill] = useState("")

    const mutation = useMutation({
      mutationFn: createMutation!,
      onSuccess: (created) => {
        queryClient.setQueryData([entityName, getOptionValue(created)], created)
        setDialogOpen(false)
        onChange(created)
      },
    })

    const navigate = useNavigate()
    const router = useRouter()
    const routeSearch = useSearch({ strict: false }) as Record<
      string,
      string | undefined
    >
    const createdId = routeSearch[`created_${entityName}`]

    useEffect(() => {
      if (!createRoute || !createdId) return
      const cached = queryClient.getQueryData<T>([entityName, createdId])
      if (cached) onChange(cached)
      navigate({
        search: (prev: any) => {
          const { [`created_${entityName}`]: _drop, ...rest } = prev
          return rest
        },
        replace: true,
      })
    }, [createdId]) // eslint-disable-line react-hooks/exhaustive-deps

    const triggerCreate = (p: string) => {
      if (createRoute) {
        navigate({
          to: createRoute,
          search: {
            prefill: p,
            returnTo:
              router.state.location.pathname + router.state.location.searchStr,
            field: entityName,
          },
        })
      } else {
        setPrefill(p)
        setDialogOpen(true)
      }
    }

    return {
      search,
      setSearch,
      isFetching,
      mergedOptions,
      triggerCreate,
      createNode:
        !createRoute && CreateForm ? (
          <CreateForm
            key={dialogOpen ? "open" : "closed"}
            prefill={prefill}
            submitting={mutation.isPending}
            onCreated={(created) => mutation.mutate(created as any)}
          />
        ) : null,
      dialogOpen,
      setDialogOpen,
    }
  }

  function Picker({ value, onChange, disabled }: PickerProps<T>) {
    const s = usePickerState(value, onChange)

    return (
      <>
        <AutoComplete<T>
          options={s.mergedOptions}
          value={value}
          loading={s.isFetching}
          disabled={disabled}
          onSearch={s.setSearch}
          onChange={onChange}
          onCreateNew={
            config.createMutation || config.createRoute
              ? s.triggerCreate
              : undefined
          }
          getOptionValue={getOptionValue}
          renderOption={renderOption}
          renderValue={renderValue}
          label={label}
        />
        {/* page-mode has no dialog; dialog-mode renders here, controlled by s.dialogOpen */}
        {!createRoute && CreateForm && (
          <Dialog open={s.dialogOpen} onOpenChange={s.setDialogOpen}>
            <DialogContent>{s.createNode}</DialogContent>
          </Dialog>
        )}
      </>
    )
  }

  function PickerField<TFieldValues extends FieldValues>({
    name,
    control,
    formLabel,
    disabled,
    description,
  }: {
    name: FieldPath<TFieldValues>
    control: Control<TFieldValues> // 👈 required now, no context fallback
    formLabel?: string
    disabled?: boolean
    description?: string
  }) {
    const { field, fieldState } = useController({ name, control })

    return (
      <Field data-invalid={fieldState.invalid}>
        {formLabel && (
          <FieldLabel htmlFor={field.name}>
            {formLabel}
            <RequiredLabelIcon />
          </FieldLabel>
        )}
        <Picker
          value={field.value}
          onChange={field.onChange}
          disabled={disabled}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )
  }

  return { Picker, PickerField }
}
