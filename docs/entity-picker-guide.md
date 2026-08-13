# Entity Picker System — Developer Guide

## What this is

A reusable pattern for "pick an entity from a list, search remotely or
locally, create a new one inline, and use it as a React Hook Form field" —
built from three layers:

```
AutoComplete            →  dumb, presentational combobox (Command + Popover)
useEntityPicker          →  headless hook: resolve-by-id, search, infinite scroll, create flow
createEntityPicker       →  factory: binds a config to AutoComplete + RHF wiring
```

Concrete pickers (`ClientPicker`, `VehicleTypePicker`, …) are just
**configured instances** of `createEntityPicker`, not separate
implementations. New entity → new config object, not new code.

---

## API response shapes

Every API call in this system returns the same envelope shape:

```tsx
export interface DetailResponse<T> {
  data: T
  message?: string
}

export interface Pagination {
  page: number
  perPage: number
  total: number
  hasMore: boolean
}

export interface ListResponse<T> {
  data: T[]
  pagination: Pagination
}
```

`detailQueryOptions`, `listQueryOptions`, **and** `createMutation` all return
`DetailResponse<T>` / `ListResponse<T>` — never a bare `T`. The hook unwraps
envelopes at read time via `select` (for detail queries) or by reading
`.data`/`.pagination` directly (for list queries), so nothing downstream
(`resolved`, `options`, `onChange`) ever deals in envelopes — only the config
boundary does.

---

## Layer 1 — `AutoComplete` (dumb, presentational)

Lives at `components/autocomplete.tsx`. Knows nothing about ids, fetching,
TanStack Query, envelopes, or forms.

**Contract:**

- `value: T | null` — **always a full resolved object, never a bare id
  string, never an envelope.** If you don't have the object yet, pass `null`
  and use `triggerLoading` instead of faking a value.
- `options: T[]` — already-resolved, already-unwrapped list to render.
- `onSearch?` (remote mode) **or** `filterFn?` (local mode) — mutually
  exclusive strategies for narrowing `options` as the user types.
- `triggerLoading?: boolean` — spinner in the trigger button while a value
  is selected-but-not-yet-resolved. Only shown when `value` is falsy.
- `onLoadMore?`, `hasMore?`, `loadingMore?` — infinite scroll. A sentinel
  element at the bottom of the list is watched via `IntersectionObserver`;
  when it scrolls into view (and `hasMore` is true, and not already
  `loadingMore`), `onLoadMore` fires automatically. No manual "Load more"
  click required.
- `onOpenChange?: (open: boolean) => void` — reports popover open/close, so
  the picker can decide when to start fetching (see "Empty search / browse
  all" below).
- `onCreateNew?: (search: string) => void` — renders a "+ Create …" row.
  Purely a UI hook — doesn't touch `value`/`onChange` itself.

**Why it's kept dumb:** every entity-specific concern (fetching, caching,
envelopes, resolving ids, pagination, create flow) lives in
`useEntityPicker`. `AutoComplete` never changes when a new entity or a new
create-flow mode is added, and it stays trivially reusable outside this
system (e.g. for a fully local, non-entity dropdown).

**Infinite scroll implementation notes:**

- The `IntersectionObserver`'s `root` is the list's own scroll container
  (`CommandList`, ref'd directly) — **not** the default viewport. Without an
  explicit `root`, "scrolled into view" would mean "visible on the page,"
  which is true almost immediately since the whole popover is on-screen.
- `CommandList` needs an actual bounded height + `overflow-y-auto` — without
  a real scrollable container, there's no scroll position for the sentinel
  to be "out of view" of, and the observer reports it as always intersecting.
- `rootMargin: "80px"` fires the load slightly before the sentinel is fully
  visible, so new items appear to load ahead of the user reaching the
  bottom rather than after a visible stall.

---

## Layer 2 — `useEntityPicker` (headless state hook)

Lives at `lib/use-entity-picker.ts`. All real behavior lives here. Zero JSX
— usable standalone for custom UI (chips, cards, a command palette) without
`AutoComplete` at all. See "Headless usage" below.

### Config shape

```tsx
export interface InfiniteListQueryConfig<T> {
  /** Must NOT vary by page — useInfiniteQuery owns pagination internally
   *  under this one key. Vary it by search/filter params only. */
  queryKey: readonly unknown[]
  queryFn: (context: { pageParam: number }) => Promise<ListResponse<T>>
  initialPageParam?: number // default 1
}

export interface EntityPickerConfig<
  T,
  TSearchParams extends { search: string } = { search: string }
> {
  entityName: string // used for the `created_${entityName}` return-nav signal

  detailQueryOptions: (id: string) => UseQueryOptions<DetailResponse<T>>
  /** Returns an infinite-query-shaped config, not a plain UseQueryOptions —
   *  see InfiniteListQueryConfig. Omit entirely for pure local mode. */
  listQueryOptions?: (params: TSearchParams) => InfiniteListQueryConfig<T>

  getOptionValue: (item: T) => string

  defaultSearchParams: TSearchParams          // e.g. { search: "", perPage: 20 }
  buildSearchParams?: (defaults, query) => TSearchParams // override reset-on-new-search logic
  searchDebounceMs?: number                   // default 300

  /** if true, fetch a first page as soon as the picker opens, even before
   *  any text is typed ("browse all" default). If false/omitted, no fetch
   *  runs until the user types something (see "Empty search" below). */
  fetchOnOpen?: boolean

  mode?: "remote" | "local"
  staticOptions?: T[] | (() => Promise<T[]>)  // local mode: fixed list, filtered client-side
  filterFn?: (option: T, query: string) => boolean

  // create flow — provide ONE of these two, not both (see Create Flow section)
  createRoute?: string
  /** SAME envelope shape as detailQueryOptions — { data, message? }, not a bare T */
  createMutation?: (data: any) => Promise<DetailResponse<T>>
}
```

### What it does, precisely

1. **Resolve-by-id.** If `value` is a bare string, runs `detailQueryOptions(id)`
   (unwrapped via `select: (res) => res.data`), `enabled` only while a string
   id is present. Once resolved, calls `onChange(resolved)` to **promote**
   the parent's state from string → full object — guarded so a late
   resolution can't stomp a selection the user already changed in the
   meantime (`value === getOptionValue(resolved)` check).

2. **Search / options (remote mode uses `useInfiniteQuery`).**
   - The raw keystroke value is debounced (`searchDebounceMs`, default
     300ms) before it's used to build the query — so typing fast fires one
     network call, not one per keystroke. The **visible** input text is
     never debounced, only the value fed into the query.
   - Every `fetchNextPage()` (triggered by `AutoComplete`'s scroll sentinel)
     **appends** a new page rather than replacing the current one —
     `rawOptions = data.pages.flatMap(page => page.data)`.
   - `hasMore`/`getNextPageParam` are derived directly from the server's
     `pagination.hasMore` / `pagination.page` — no client-side guessing.
   - Local mode: fetches `staticOptions` once (`staleTime: Infinity`),
     filters client-side via `filterFn`. No pagination concept in local mode
     — `hasMore`/`fetchMore` are always `false`/`undefined`.
   - **Pinning:** if the resolved/selected object isn't present in the
     current `options` (common in remote mode — fetched by id, not by
     search), it's pinned to the front of the list so the dropdown always
     shows a checkmark next to the current selection. Suppressed once the
     user has typed a query, so a stale pin doesn't sit unexplained atop
     unrelated search results.

3. **Create flow** (see dedicated section below).

### Empty search / "browse all" vs. type-to-search

By default, the remote query only runs once the user has typed something
(`search.length > 0`) — before that, `options` is empty and there is
genuinely nothing to fetch. This has two visible consequences worth being
deliberate about, not accidental:

- **"No results" never shows before the first keystroke**, because no query
  has run yet — showing a generic "No {label} found" in that state is
  misleading (it reads as "there are zero clients," not "you haven't
  searched yet"). `AutoComplete` distinguishes the two states in its empty
  message when `onSearch` is set and `search` is empty:
  `"Type to search..."` vs. the real not-found message.
- **"Load more" never shows before the first keystroke**, for the same
  reason — there's no fetched page to paginate from yet. This is expected,
  not a bug, under type-to-search.

**If you want a picker to show a first page immediately on open** (browse-all
default, common for pickers where the full list isn't huge), set
`fetchOnOpen: true` in the config. This wires `AutoComplete`'s
`onOpenChange` through to the hook and drops the `search.length > 0` gate in
favor of `enabled: !isLocal && !!listConfig && isOpen`. Confirm your list
endpoint treats `search: ""` as "unfiltered" before relying on this — most
do, but it's worth checking rather than assuming.

### Return shape

```tsx
{
  search, searchParams, setSearch,
  fetchMore, isFetchingMore, hasMore,
  filterFn, options, isFetching, resolved, isResolving,
  isSelected(option),
  canCreate, triggerCreate, createDialog: { open, setOpen, prefill, submitting, submit },
}
```

---

## Layer 3 — `createEntityPicker` (factory)

Lives at `components/entity-picker/entity-picker-builder.tsx`.

```tsx
const { Picker, PickerField, usePicker } = createEntityPicker<Client>({ ...config })
```

- **`Picker`** — `AutoComplete` wired to `useEntityPicker`, plus the create
  dialog when `createMutation`/`CreateForm` are configured. Forwards
  `hasMore`/`onLoadMore`/`loadingMore`/`triggerLoading` from the hook into
  `AutoComplete` — **all four must be wired**, a common mistake is adding a
  new hook return value and forgetting to thread it through here, which
  silently disables the feature at the `AutoComplete` layer while the hook
  itself works correctly. Accepts per-instance overrides: `renderOption`,
  `renderValue`, `staticOptions`, `filterFn` — falls back to the config's
  defaults when omitted.
- **`PickerField`** — RHF wrapper via `useController`. **`control` is a
  required prop, not read from `useFormContext`** — no `<FormProvider>`
  dependency by design. Every usage explicitly states which form it belongs
  to; the cost is threading `control` down through nested sections yourself
  where needed.
- **`usePicker`** — the config-bound `useEntityPicker`, for custom UI on top
  of this entity without `AutoComplete`.

### Why a factory, not one generic `<EntityPicker entity="client">` component

A single generic component would need every call site to repeat the entire
config at every usage. The factory computes config once, at module scope;
call sites just import the ready-made `ClientPicker` — no repetition, `T`
inferred once at the factory call.

---

## Query key pattern — separate factories for tables vs. pickers

A data table and an entity picker are both "list clients," but they have
genuinely different shapes and lifecycles — don't share one `queryOptions`
factory between them.

| | Table | Picker (search) |
|---|---|---|
| Params | page, perPage, sort, column filters | debounced `search` + small `perPage` |
| Result size | large pages, sortable | small pages, no sorting |
| Fields needed | many columns | just enough for `renderOption`/`renderValue` |
| Query style | `useQuery`, replace-on-page-change | `useInfiniteQuery`, accumulate-on-scroll |
| Triggered by | pagination/sort/filter UI | debounced keystrokes |

**Pattern: separate leaf factories, shared root key namespace** (so a single
`invalidateQueries` after a mutation refreshes both, without having to
remember two separate invalidation calls):

```tsx
export const clientsQueryKeys = {
  all: () => ["clients"] as const,
  details: () => [...clientsQueryKeys.all(), "detail"] as const,
  detail: (id: string) => [...clientsQueryKeys.details(), id] as const,

  table: () => [...clientsQueryKeys.all(), "table"] as const,
  tableList: (params: ClientTableParams) => [...clientsQueryKeys.table(), params] as const,

  search: () => [...clientsQueryKeys.all(), "search"] as const,
  searchList: (params: ClientSearchParams) =>
    [...clientsQueryKeys.search(), params.search, params.perPage] as const, // no page — infinite query owns that
}

// table
interface ClientTableParams { page: number; perPage: number; sortBy?: string; sortDir?: "asc" | "desc"; status?: string }

export const clientTableQueryOptions = (params: ClientTableParams) =>
  queryOptions({
    queryKey: clientsQueryKeys.tableList(params),
    queryFn: () => getClientsTableFn(params), // full ListResponse<Client>, all columns
  })

// picker
export interface ClientSearchParams { search: string; perPage: number }

export const clientSearchQueryOptions = (params: ClientSearchParams) => ({
  queryKey: clientsQueryKeys.searchList(params),
  queryFn: ({ pageParam }: { pageParam: number }) =>
    getClientsSearchFn({ search: params.search, perPage: params.perPage, page: pageParam }),
  initialPageParam: 1,
})
```

`queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all() })` after
any client mutation refreshes `table`, `search`, and `details` together.
Only split the actual **API endpoint** too (not just the client-side
factory) if the picker genuinely benefits from a lighter payload (e.g. a
`?fields=id,name` projection) — not required just to have separate
factories.

---

## Concrete example — `ClientPicker` (remote, infinite scroll)

```tsx
export const clientDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: clientsQueryKeys.detail(id),
    queryFn: () => getClientFn({ id }), // -> DetailResponse<Client>
  })

export const createClientFn = (data: { name: string; email: string; phone?: string }) =>
  fetch("/api/clients", { method: "POST", body: JSON.stringify(data) })
    .then((r) => r.json()) // -> DetailResponse<Client>, same shape as getClientFn

export const { Picker: ClientPicker, PickerField: ClientPickerField } =
  createEntityPicker<Client, ClientSearchParams>({
    entityName: "client",
    listQueryOptions: clientSearchQueryOptions,
    detailQueryOptions: clientDetailQueryOptions,
    defaultSearchParams: { search: "", perPage: 20 },
    getOptionValue: (c) => c.id,
    renderOption: (c) => c.name,
    renderValue: (c) => c.name,
    createMutation: createClientFn,
    CreateForm: ClientQuickForm,
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
    staticOptions: () => getVehicleTypesFn({ perPage: 200 }).then((res) => res.data),
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

`useEntityPicker` has zero JSX. Two ways to reach it:

- **`usePicker`** (returned by `createEntityPicker`) — same config as the
  entity's `Picker`/`PickerField`, shares cache keys and create-flow
  behavior. Use when you want different UI on an entity you've already
  configured.
- **`useEntityPicker` directly** — inline config, for a one-off picker that
  doesn't warrant its own `create*Picker` export.

```tsx
function VehicleTypeChips({ value, onChange }: {
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
      staticOptions: () => getVehicleTypesFn({ perPage: 200 }).then((res) => res.data),
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
          className={cn("rounded-full px-3 py-1 text-sm border", p.isSelected(type) && "bg-primary text-primary-foreground")}
        >
          {type.name}
        </button>
      ))}
    </div>
  )
}
```

What you get without `AutoComplete`: `options`, `isFetching`, `resolved`,
`isSelected(option)`, `search`/`setSearch`, `fetchMore`/`hasMore`/`isFetchingMore`,
`canCreate`/`triggerCreate`/`createDialog`. What you don't get: any markup —
including the `isResolving` (trigger loading) handling, which a custom UI
needs to account for itself (e.g. a skeleton instead of leaking a raw id).

---

## Create flow — dialog vs. page

Config takes **one of two shapes**:

| | `createMutation` + `CreateForm` (dialog) | `createRoute` (page) |
|---|---|---|
| Use when | short form, few fields | long/multi-step form, needs its own URL |
| Navigation | none — stays on the same page | full route change |
| Mechanism | mutation `onSuccess` calls `onChange` directly | search-param round trip |

Both converge on the same event: exactly one call to `onChange(created)`.
Nothing downstream cares which mode produced it.

### Dialog mode

```tsx
createMutation: createClientFn, // -> DetailResponse<Client>
CreateForm: ClientQuickForm,    // (prefill, onCreated, submitting) => JSX
```

`onCreated` wires to `mutation.mutate`. On success: cache seeded at
`detailQueryOptions(created.data.id).queryKey` with the **envelope as-is**
(no manual re-wrapping needed now that `createMutation` matches
`DetailResponse<T>`), `onChange(created.data)` fires, dialog closes.

### Page mode

```tsx
createRoute: "/clients/new",
```

Flow:
1. `triggerCreate` navigates to `/clients/new?prefill=...&returnTo=<path>&field=client`.
2. The route reads those params, renders the full form, and on success:
   ```tsx
   queryClient.setQueryData(clientsQueryKeys.detail(created.data.id), created)
   navigate({ to: returnTo, search: { [`created_client`]: created.data.id } })
   ```
   — must use the **same** `detailQueryOptions`/key and the **same envelope
   shape** as the picker reads, or the picker's resolve-by-id query won't
   hit this seeded entry.
3. Back on the original page, the hook reads `created_${entityName}` from
   route search params, reads the (already seeded, so instant) cache entry,
   unwraps `.data`, calls `onChange`, then **strips the param** (one-shot
   signal — prevents refresh/back-nav from re-triggering selection with a
   stale id).

**TanStack Router specifics:** requires `validateSearch` (zod) on both the
picker's host route and the create route. Picker components use
`useSearch({ strict: false })` since they're reusable across routes and
can't bind to one specific `from` — see Known Limitations.

### Hybrid (optional escalation)

`ClientQuickForm` (dialog) can contain a "need more fields? →" link that
navigates to `/clients/new` with the same `prefill`/`returnTo`/`field`
params, closing the dialog as it does. The page route's `onSuccess` doesn't
care whether it was reached via the dialog's escape hatch or a direct link.

---

## Trigger loading state (never show a raw id)

`AutoComplete.value` must never be a bare id string. `Picker` always passes
`p.resolved ?? null`, never the raw `T | string` value, with
`triggerLoading={p.isResolving}` so the trigger shows a spinner instead of
an id, a blank field, or a misleading "Select..." placeholder.

`isResolving` is `!!idToResolve && isLoading` — deliberately `isLoading`
(first fetch only), not `isFetching` (which also covers background
revalidation), so an already-cached value silently revalidating doesn't get
hidden behind a spinner it doesn't need.

**If the spinner isn't visible on a hard reload**, check in order:
1. Does a network request actually fire (Network tab)? If not, a router
   loader is likely prefetching and seeding the cache before the component
   mounts as "loading" — nothing to show a spinner for, this is correct.
2. Is the fetch just fast enough to be imperceptible? Wrap `isResolving` in
   a minimum-display-duration hook (~300ms floor) if a perceivable state
   matters more than fetch speed.

---

## Known limitations / things to revisit

- **`useSearch({ strict: false })` in shared components is a real trade-off**
  — reusable pickers can't type-bind to one route's search schema. If a
  picker is only used on a small, known set of routes, consider having each
  *route* read its own `created_*` param (with a proper `from`) and pass it
  into the picker as a plain prop instead.
- **Config isn't a discriminated union yet** — nothing stops configuring
  both `createRoute` and `createMutation` (page silently wins) or neither
  (create button silently does nothing). Worth tightening to a
  `{ mode: "page"; createRoute } | { mode: "dialog"; createMutation; CreateForm }`
  union so misconfiguration fails at compile time.
- **Shape mismatches between detail and search/list results** — if your
  search endpoint returns a slimmer projection than your detail endpoint,
  keep `renderOption`/`renderValue` scoped to fields both guarantee, or make
  the shapes match.
- **`Picker` must forward every relevant hook return value into
  `AutoComplete`** (`hasMore`, `onLoadMore`, `loadingMore`, `triggerLoading`,
  `onOpenChange` if using `fetchOnOpen`) — the hook computing a value
  correctly does not mean the feature works if `Picker` forgot to pass it
  through. Double-check this list whenever a new capability is added to the
  hook.
- **`IntersectionObserver` root must be the list's own scroll container**,
  not the default viewport, or "load more" never fires. `CommandList` needs
  an explicit bounded height + `overflow-y-auto`.
- **`fetchOnOpen` assumes the backend treats `search: ""` as unfiltered.**
  Confirm this per entity before enabling — some endpoints may reject or
  error on an empty search term.

---

## Adding a new entity — checklist

1. Do you have (or need to write) `detailQueryOptions` and a search-specific
   `listQueryOptions` (infinite-query shaped, separate from any table
   factory for the same entity)? Confirm both return `DetailResponse<T>` /
   `ListResponse<T>` envelopes, matching every other entity.
2. Decide **remote** (server search) vs. **local** (small fixed list).
3. Decide **`fetchOnOpen`**: browse-all-on-open, or type-to-search only.
4. Decide create flow: **dialog** (short form) or **page** (long form) — not
   both. Ensure `createMutation` (if used) returns `DetailResponse<T>`, same
   as `detailQueryOptions`.
5. Write `getOptionValue`, `renderOption`, optionally `renderValue`.
6. Call `createEntityPicker<YourType, YourSearchParams>({ ...config })`,
   export `Picker`/`PickerField` (and `usePicker` if custom UI is likely).
7. Use `<YourEntityPickerField name="..." control={control} />` in forms —
   `control` is always required, no `FormProvider` needed anywhere.
