# Entity Picker System — Developer Guide

## What this is

A reusable pattern for "pick an entity from a list, search remotely or locally,
create a new one inline, and use it as a React Hook Form field" — built from
three layers:

```
AutoComplete            →  dumb, presentational combobox (Command + Popover)
useEntityPicker         →  headless hook: resolve-by-id, search, create flow
createEntityPicker      →  factory: binds a config to AutoComplete + RHF wiring
```

Concrete pickers (`ClientPicker`, `VehicleTypePicker`, …) are just
**configured instances** of `createEntityPicker`, not separate
implementations. New entity → new config object, not new code.

---

## Layer 1 — `AutoComplete` (dumb, presentational)

Lives at `components/autocomplete.tsx`. Knows nothing about ids, fetching,
TanStack Query, or forms.

**Contract:**
- `value: T | null` — **always a full resolved object, never a bare id
  string.** If you don't have the object yet, pass `null` and use
  `triggerLoading` instead of faking a string value.
- `options: T[]` — already-resolved list to render (search results, static
  list, or merged-with-pinned-selection — decided by the caller).
- `onSearch?` (remote mode) **or** `filterFn?` (local mode) — mutually
  exclusive strategies for narrowing `options` as the user types.
- `triggerLoading?: boolean` — shows a spinner in the trigger button when a
  value is *conceptually* selected but not yet resolved to a renderable
  object. Only shown when `value` is falsy (never overrides an already-loaded
  value).
- `onCreateNew?: (search: string) => void` — renders a "+ Create …" row at
  the bottom of the list. Purely a UI hook; doesn't touch `value`/`onChange`
  itself — the caller decides what "create" means (dialog vs. navigation).

**Why it's kept dumb:** every entity-specific concern (fetching, caching,
resolving ids, create flow) lives in `useEntityPicker` instead. This means
`AutoComplete` never needs to change when a new entity or a new create-flow
mode is added, and it stays trivially testable/reusable outside this system.

---

## Layer 2 — `useEntityPicker` (headless state hook)

Lives at `lib/use-entity-picker.ts`. This is where all the real behavior is.
It has **no JSX** — usable standalone for custom UI (chips, cards, a command
palette) without `AutoComplete` at all.

### Config shape

```tsx
/** Matches your API's actual response envelopes. */
interface DetailResponse<T> {
  data: T
  message?: string
}

interface Pagination {
  page: number
  perPage: number
  total: number
  hasMore: boolean
}

interface ListResponse<T> {
  data: T[]
  pagination: Pagination
}

interface EntityPickerConfig<T, TSearchParams extends { search: string }> {
  entityName: string // used for the `created_${entityName}` return-nav signal

  // Reuse your EXISTING queryOptions factories verbatim — same cache
  // entries as every other place in the app that reads/writes this entity.
  // These return the RAW envelope shape; the hook unwraps `.data` itself
  // via `select`, so cache entries stay identical to what the rest of the
  // app already reads/writes (e.g. a detail page using the same
  // detailQueryOptions still gets the full { data, message } envelope).
  detailQueryOptions: (id: string) => UseQueryOptions<DetailResponse<T>>
  listQueryOptions?: (params: TSearchParams) => UseQueryOptions<ListResponse<T>>

  getOptionValue: (item: T) => string

  defaultSearchParams: TSearchParams          // e.g. { search: "", perPage: 50 }
  buildSearchParams?: (defaults, query) => TSearchParams // override reset-on-new-search logic
  searchDebounceMs?: number                   // default 300

  mode?: "remote" | "local"
  staticOptions?: T[] | (() => Promise<T[]>)  // local mode: fixed list, filtered client-side
  filterFn?: (option: T, query: string) => boolean

  // create flow — provide ONE of these two, not both (see Create Flow section)
  createRoute?: string
  createMutation?: (data: any) => Promise<T>  // mutation still returns the bare entity, not an envelope
}
```

**Why unwrap with `select`, not by writing `.data.data` everywhere in the
hook:** `useQuery`'s `select` option projects the cached value at read time —
the cache itself still stores the full envelope (so anything else in the app
reading the same query key via `useQuery(detailQueryOptions(id))` without a
`select` still gets `{ data, message }` untouched), but `useEntityPicker`
only ever sees the unwrapped `T`/`T[]`, plus `pagination` pulled out
separately for list queries. One unwrap point, not scattered `.data` access
through the rest of the hook.

```tsx
// inside useEntityPicker
const { data: resolved } = useQuery({
  ...config.detailQueryOptions(idToResolve!),
  select: (res) => res.data,          // DetailResponse<T> -> T
  enabled: !!idToResolve,
  staleTime: 5 * 60 * 1000,
})

const remoteQuery = useQuery({
  ...config.listQueryOptions!(searchParams),
  select: (res) => res, // keep the envelope here — need both data and pagination
  enabled: !isLocal && !!config.listQueryOptions && debouncedSearch.length > 0,
})

const rawOptions = isLocal ? (localQuery.data ?? []) : (remoteQuery.data?.data ?? [])
const pagination = isLocal ? null : (remoteQuery.data?.pagination ?? null)
```

**Cache-seeding after create must match the envelope shape too** — since
`createMutation` returns a bare `T` (not an envelope, per your mutation
functions), seeding the detail cache has to wrap it before `setQueryData`,
or a subsequent read via `detailQueryOptions` (which expects
`DetailResponse<T>`) would break:

```tsx
onSuccess: (created) => {
  queryClient.setQueryData(
    config.detailQueryOptions(config.getOptionValue(created)).queryKey!,
    { data: created } as DetailResponse<T> // match the envelope, not the bare entity
  )
  onChange(created)
  setDialogOpen(false)
},
```

Same applies to the page-mode create route's `onSuccess` — it must seed
`{ data: created }`, not `created`, at the shared `detailQueryOptions` key.

### `pagination` replaces the earlier "grow `perPage` and refetch" guess

With a real `pagination.hasMore` from the server, "load more" no longer has
to infer anything — the hook exposes it directly:

```tsx
return {
  // ...
  hasMore: pagination?.hasMore ?? false,
  updateSearchParams, // still available for callers that want to bump perPage/page directly
  // ...
}
```

`Picker`'s "Load more" row can now check `p.hasMore` instead of always
showing regardless of whether more data actually exists:

```tsx
{p.hasMore && p.updateSearchParams && (
  <CommandItem onSelect={() => p.updateSearchParams((prev) => ({ ...prev, perPage: prev.perPage + 50 }))}>
    {p.isFetchingMore ? "Loading..." : "Load more"}
  </CommandItem>
)}
```

This is still "refetch a bigger page," not "accumulate distinct pages" — see
Known Limitations — but at least it now stops offering "Load more" once the
server says there's nothing left.



### What it does, precisely

1. **Resolve-by-id.** If `value` is a bare string, runs
   `detailQueryOptions(id)` (`enabled` only when a string id is present).
   Once resolved, calls `onChange(resolved)` to **promote** the parent's
   state from string → full object — but only if `value` is *still* the same
   id being resolved (guards against a late resolution stomping a selection
   the user already changed).

2. **Search / options.**
   - Remote mode: debounces the raw keystroke value
     (`searchDebounceMs`, default 300ms) before it hits
     `listQueryOptions(params)`, so typing fast fires one network call, not
     one per keystroke. The **visible** input value is never debounced — only
     the value fed into the query is.
   - Local mode: fetches `staticOptions` once (`staleTime: Infinity`) and
     filters client-side via `filterFn`.
   - **Pinning:** if the resolved/selected object isn't present in the
     current `options` (common in remote mode — it was fetched by id, not by
     search), it's pinned to the front of the list so the dropdown always
     shows a checkmark next to the current selection. Pinning is suppressed
     once the user has actually typed a query (`search.length > 0`), so a
     stale pin doesn't sit unexplained atop unrelated search results.

3. **Load more / pagination.** `updateSearchParams(updater)` lets a caller
   mutate params (e.g. bump `perPage`) without resetting `search` — distinct
   from `setSearch(query)`, which resets to `defaultSearchParams` on every
   new typed query (a new search starts over; loading more does not).
   **Caveat:** as implemented, "load more" means *refetch a bigger page*, not
   *accumulate distinct pages* — that's `useInfiniteQuery` territory if true
   infinite-scroll accumulation is ever needed; not yet built.

4. **Create flow** (see dedicated section below).

### Return shape

```tsx
{
  search, searchParams, setSearch, updateSearchParams, isFetchingMore,
  filterFn, options, isFetching, resolved, isResolving,
  isSelected(option),
  canCreate, triggerCreate, createDialog: { open, setOpen, prefill, submitting, submit },
}
```

---

## Layer 3 — `createEntityPicker` (factory)

Lives at `lib/create-entity-picker.tsx`. Takes an `EntityPickerConfig` +
render functions, returns three things:

```tsx
const { Picker, PickerField, usePicker } = createEntityPicker<Client>({ ...config })
```

- **`Picker`** — `AutoComplete` wired to `useEntityPicker`, plus the create
  dialog when `createMutation`/`CreateForm` are configured. Accepts
  per-instance overrides: `renderOption`, `renderValue`, `staticOptions`,
  `filterFn` — falls back to the config's defaults when omitted, so most call
  sites need zero extra props, but a compact table-row usage can override
  just what it needs.
- **`PickerField`** — RHF wrapper via `useController`. **`control` is a
  required prop, not read from `useFormContext`** — no `<FormProvider>`
  dependency by design; every usage explicitly states which form it belongs
  to, at the cost of threading `control` down through nested sections
  yourself where needed.
- **`usePicker`** — the config-bound `useEntityPicker`, for building custom
  UI on top of this entity without `AutoComplete`.

### Why a factory, not one generic `<EntityPicker entity="client">` component

A single generic component would need every call site to repeat the entire
config (`search`, `fetchById`, render fns, …) at every usage. The factory
computes config once, at module scope; call sites just import the ready-made
`ClientPicker` — no repetition, and `T` is inferred once at the factory call.

---

## Concrete example — `ClientPicker` (remote, paginated)

```tsx
// queries/clients.ts
export const clientsQueryKeys = {
  all: () => ["clients"] as const,
  list: () => [...clientsQueryKeys.all(), "list"] as const,
  details: () => [...clientsQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...clientsQueryKeys.details(), id] as const,
}

// components/pickers/client-picker.tsx
interface ClientSearchParams { search: string; perPage: number }

const clientListQueryOptions = ({ search, perPage }: ClientSearchParams) =>
  queryOptions({
    queryKey: [...clientsQueryKeys.list(), search, perPage],
    queryFn: () => getClientsFn({ search, perPage }),
  })

const clientDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: clientsQueryKeys.detail(id),
    queryFn: () => getClientFn({ id }),
  })

export const { Picker: ClientPicker, PickerField: ClientPickerField } =
  createEntityPicker<Client, ClientSearchParams>({
    entityName: "client",
    listQueryOptions: clientListQueryOptions,
    detailQueryOptions: clientDetailQueryOptions,
    defaultSearchParams: { search: "", perPage: 50 },
    getOptionValue: (c) => c.id,
    renderOption: (c) => c.name,
    renderValue: (c) => c.name,
    createRoute: "/clients/new",       // OR createMutation + CreateForm — see below
  })
```

Usage in a form (no `FormProvider` needed):

```tsx
function BookingForm() {
  const { control, handleSubmit } = useForm<BookingFormValues>()
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ClientPickerField name="clientId" control={control} formLabel="Client" />
      <button type="submit">Save</button>
    </form>
  )
}
```

## Concrete example — `VehicleTypePicker` (local, static)

```tsx
export const { Picker: VehicleTypePicker, PickerField: VehicleTypePickerField } =
  createEntityPicker<VehicleType>({
    entityName: "vehicleType",
    detailQueryOptions: vehicleTypeDetailQueryOptions,
    defaultSearchParams: { search: "" },
    getOptionValue: (t) => t.id,
    renderOption: (t) => t.name,
    mode: "local",
    staticOptions: () => getVehicleTypesFn({ perPage: 200 }),
    filterFn: (t, q) => t.name.toLowerCase().includes(q.toLowerCase()),
  })
```

Per-instance override (e.g. compact usage in a table row):

```tsx
<ClientPickerField
  name={`items.${index}.clientId`}
  control={control}
  renderOption={(c) => c.name}   // no subtitle/avatar in this context
  renderValue={(c) => c.name}
/>
```

---

## Using `useEntityPicker` without `Picker` (headless, custom UI)

`useEntityPicker` has zero JSX — it's fully usable on its own for a custom
UI (chips, cards, a command palette, anything that isn't `AutoComplete`).
Two ways to reach it:

- **`usePicker`** (returned by `createEntityPicker`) — same config as the
  entity's `Picker`/`PickerField`, so it shares cache keys, create-flow
  behavior, etc. Use this when you already have (or want) a named
  `ClientPicker`-style config and just want different UI on top of it.
- **`useEntityPicker` directly** — pass a config inline, for a one-off
  picker that doesn't warrant its own `create*Picker` export at all.

### Example: chip-style selector instead of a dropdown

```tsx
import { useEntityPicker } from "@/lib/use-entity-picker"

function VehicleTypeChips({
  value,
  onChange,
}: {
  value: VehicleType | string | null
  onChange: (v: VehicleType | null) => void
}) {
  const p = useEntityPicker(
    {
      entityName: "vehicleType",
      detailQueryOptions: vehicleTypeDetailQueryOptions,
      defaultSearchParams: { search: "" },
      getOptionValue: (t) => t.id,
      mode: "local",
      staticOptions: () => getVehicleTypesFn({ perPage: 200 }),
    },
    value,
    onChange
  )

  if (p.isFetching) return <Skeleton className="h-8 w-full" />

  return (
    <div className="flex flex-wrap gap-2">
      {p.options.map((type) => (
        <button
          key={type.id}
          onClick={() => onChange(p.isSelected(type) ? null : type)}
          className={cn(
            "rounded-full px-3 py-1 text-sm border",
            p.isSelected(type) && "bg-primary text-primary-foreground"
          )}
        >
          {type.name}
        </button>
      ))}
    </div>
  )
}
```

### Example: reusing an existing config's hook via `usePicker`

```tsx
// client-picker.tsx already exports:
export const { Picker: ClientPicker, PickerField: ClientPickerField, usePicker: useClientPicker } =
  createEntityPicker<Client, ClientSearchParams>({ ...config })

// elsewhere — a custom "recent clients" rail, same cache/search/create
// behavior as ClientPicker, totally different UI
function RecentClientsRail({ value, onChange }: { value: Client | string | null; onChange: (c: Client | null) => void }) {
  const p = useClientPicker(value, onChange)

  return (
    <div className="flex gap-3 overflow-x-auto">
      {p.options.slice(0, 8).map((client) => (
        <ClientCard key={client.id} client={client} selected={p.isSelected(client)} onClick={() => onChange(client)} />
      ))}
      {p.canCreate && <NewClientCard onClick={() => p.triggerCreate("")} />}
    </div>
  )
}
```

### What you get without `AutoComplete`

`p` exposes everything a custom UI needs, with no rendering assumptions:

- `options`, `isFetching`, `resolved` — the resolved list + loading state
- `isSelected(option)` — selection check, handles the `T | string` value
  duality for you
- `search`, `setSearch`, `updateSearchParams`, `isFetchingMore` — for a
  custom search box / load-more control, if you build one
- `canCreate`, `triggerCreate`, `createDialog` — same create-flow plumbing;
  `createDialog` gives you `{ open, setOpen, prefill, submitting, submit }`
  to build your own dialog/panel instead of the default one `Picker` renders

What you **don't** get for free: any actual markup. `p.isResolving` (trigger
loading) also applies here — a custom UI resolving a bare id should account
for it the same way `Picker` does, e.g. show a skeleton instead of leaking
the raw id.

---

## Create flow — dialog vs. page

Config takes **one of two shapes** — pick based on how much the create form
needs:

| | `createMutation` + `CreateForm` (dialog) | `createRoute` (page) |
|---|---|---|
| Use when | short form, few fields | long/multi-step form, needs its own URL |
| Navigation | none — stays on the same page | full route change |
| Mechanism | mutation `onSuccess` calls `onChange` directly | search-param round trip (below) |

**Both converge on the same event: exactly one call to `onChange(created)`.**
Nothing downstream cares which mode produced it.

### Dialog mode

```tsx
createMutation: createClientFn,
CreateForm: ClientQuickForm, // (prefill, onCreated, submitting) => JSX
```

`ClientQuickForm`'s `onSubmit` calls `onCreated(formData)`, which the hook
wires straight to `mutation.mutate`. On success: cache is seeded at
`detailQueryOptions(created.id).queryKey`, `onChange(created)` fires, dialog
closes. No routing involved — the component tree never unmounts.

### Page mode

```tsx
createRoute: "/clients/new",
```

Flow:
1. User clicks "+ Create" → `triggerCreate` navigates to
   `/clients/new?prefill=...&returnTo=<current path>&field=client`.
2. The `/clients/new` route reads those search params, renders the full
   form, and on success:
   - Seeds the cache: `queryClient.setQueryData(detailQueryOptions(id).queryKey, created)`
     — **must use the exact same `queryOptions` factory** as the picker, or
     the picker's resolve-by-id query won't hit this cache entry.
   - Navigates back to `returnTo` with `?created_client=<id>` appended.
3. Back on the original page, `useEntityPicker`'s effect reads
   `created_${entityName}` from the route's search params, reads the
   (already seeded, so instant) cache entry, calls `onChange(cached)`, then
   **strips the param** from the URL (one-shot signal — prevents a page
   refresh or back/forward navigation from re-triggering selection with a
   stale id).

**TanStack Router specifics:**
- Requires `validateSearch` (zod schema) on both the picker's host route and
  the create route, for `created_${entityName}`/`prefill`/`returnTo`/`field`.
- `useSearch({ strict: false })` is used inside the (route-agnostic, reusable)
  picker components, since they can't bind to one specific `from` route. This
  is a deliberate trade-off — see "Known limitations" below.

### Hybrid (optional escalation)

Nothing stops `ClientQuickForm` (dialog) from containing a "need more
fields? →" link that navigates to `/clients/new` with the same
`prefill`/`returnTo`/`field` params, closing the dialog as it does. The page
route's `onSuccess` handler doesn't care whether it was reached via the
dialog's escape hatch or a direct link — same contract either way.

---

## Trigger loading state (don't show a raw id)

`AutoComplete.value` must **never** be a bare id string — `Picker` always
passes `p.resolved ?? null` down, never the raw `T | string` value. While a
string `value` is being resolved, `Picker` passes `triggerLoading={p.isResolving}`
so the trigger shows a spinner instead of an id, a blank field, or (worse) a
flash of the "Select..." placeholder that implies nothing is chosen.

```tsx
<AutoComplete
  value={p.resolved ?? null}
  triggerLoading={p.isResolving}
  ...
/>
```

`isResolving` is `!!idToResolve && isLoading` (first-fetch only — not background
revalidation) — deliberately uses `isLoading`, not `isFetching`, so an
already-cached, silently-revalidating value doesn't get hidden behind a
spinner it doesn't need.

**If the spinner isn't visible on a hard reload:** this is usually correct
behavior, not a bug. Check, in order:
1. Is a network request actually firing (Network tab)? If not, a router
   loader is likely prefetching this query and seeding the cache before the
   component ever mounts as "loading" — there's genuinely nothing to show a
   spinner for.
2. Is the fetch just fast enough to be imperceptible? If so and you still
   want a perceivable state, wrap `isResolving` in a minimum-display-duration
   hook (~300ms floor) rather than trying to make the real fetch slower.

---

## Known limitations / things to revisit

- **No true infinite-scroll accumulation** — "load more" grows `perPage` and
  refetches (now gated correctly by the server's `pagination.hasMore`), but it
  still doesn't concatenate distinct pages. Switch to `useInfiniteQuery` if
  real cursor/page accumulation is needed.
- **Envelope unwrap is manual per query** — `select` unwraps `detailQueryOptions`
  to `T` and pulls `data`/`pagination` apart for list queries. If any entity's
  API deviates from the `{ data, pagination? }` / `{ data, message? }`
  envelope shape, its config needs a bespoke `select`, not the shared one.
- **`useSearch({ strict: false })` in shared components is a real trade-off**
  — reusable pickers can't type-bind to one route's search schema. If a
  picker is only ever used on a small, known set of routes, consider having
  each *route* read its own `created_*` param (with a proper `from`) and pass
  it into the picker as a plain prop instead, keeping the picker fully
  router-agnostic.
- **Config isn't a discriminated union yet** — nothing stops someone from
  configuring both `createRoute` and `createMutation` (page silently wins) or
  neither (create button silently does nothing). Worth tightening to a
  `{ mode: "page"; createRoute } | { mode: "dialog"; createMutation; CreateForm }`
  union so misconfiguration fails at compile time.
- **Shape mismatches between `detailQueryOptions` and `listQueryOptions`
  results** — if your search endpoint returns a slimmer projection than your
  detail endpoint (e.g. no `email` field), a `renderOption`/`renderValue`
  that reaches for a detail-only field will render inconsistently between a
  pinned/resolved row and a plain search-result row. Keep render functions
  scoped to fields both endpoints guarantee, or make the two endpoints return
  matching shapes.
- **`listQueryOptions` is required by the config type even in pure local
  mode**, where it's never called. Should be made optional
  (`listQueryOptions?:`) with the remote-mode `useQuery` call guarded
  accordingly.

---

## Adding a new entity — checklist

1. Do you already have `queryOptions` factories for detail + list? Reuse them
   verbatim as `detailQueryOptions` / `listQueryOptions`.
2. Decide **remote** (server search) vs. **local** (small fixed list) mode.
3. Decide create flow: **dialog** (short form) or **page** (long form) — not
   both.
4. Write `getOptionValue`, `renderOption`, optionally `renderValue`.
5. Call `createEntityPicker<YourType, YourSearchParams>({ ...})`, export
   `Picker`/`PickerField` (and `usePicker` if you anticipate custom UI needs).
6. Use `<YourEntityPickerField name="..." control={control} />` in forms —
   `control` is always required, no `FormProvider` needed anywhere.
