/**
 * PriceScheduleForm
 * ------------------
 * A dynamic distance x tonnage price-schedule editor that saves/loads against
 * a SINGLE table: `distance_tonnage_rates`.
 *
 * EDITING MODEL (in-memory only, never sent to the DB as-is): brackets are
 * tracked with small ids (t_0_2, d_0_40, ...) purely so the UI can let you
 * edit a bracket's bounds once and have it apply to every price cell that
 * uses it, and so overlap can be checked per axis. This shape never touches
 * your database.
 *
 *   {
 *     "tonnageRanges": [{ "id": "t_0_2", "min": 0, "max": 2 }, ...],
 *     "distanceRanges": [{ "id": "d_0_40", "min": 0, "max": 40, "noUpperLimit": false }, ...],
 *     "rates": [
 *       { "distanceRangeId": "d_0_40", "tonnageRangeId": "t_0_2", "minPrice": 2220, "maxPrice": 2664 },
 *       ...
 *     ]
 *   }
 *
 * DB / SAVE PAYLOAD - what actually goes to `distance_tonnage_rates`, via
 * `toDbRows(schedule)`: one flat, self-contained row per price cell, bounds
 * inlined (no foreign keys, no joins):
 *
 *   [
 *     {
 *       "distance_min": 0, "distance_max": 40, "distance_no_upper_limit": false,
 *       "tonnage_min": 0, "tonnage_max": 2,
 *       "min_price": 2220, "max_price": 2664
 *     },
 *     ...
 *   ]
 *
 * `fromDbRows(rows)` does the reverse - given rows queried back from that
 * table, it re-derives the deduplicated bracket lists for the editing UI.
 * Both are exported as named exports below. See README.md for the table DDL.
 *
 * - Tonnage brackets and distance brackets are both fully dynamic (add / remove).
 * - Every (distance bracket x tonnage bracket) cell holds a Min price and a Max price.
 * - Neither axis may contain overlapping ranges (validated live, blocks saving).
 * - Tonnage is hard-capped at 30 MT.
 * - Two read-only views of the saved schedule: a pivot Grid (matches the
 *   original spreadsheet) and a sortable/searchable flat List, both built
 *   with @tanstack/react-table directly off the `rates` array.
 *
 * Peer dependencies (install in your app):
 *   npm i react-hook-form @tanstack/react-table lucide-react
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import {
  Plus,
  Trash2,
  AlertTriangle,
  Pencil,
  Download,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';

const MAX_TONNAGE = 30;

// ---------------------------------------------------------------------------
// Id generation - keeps our own stable ids separate from RHF's internal keys.
// ---------------------------------------------------------------------------
let idCounter = 0;
const makeId = (prefix) => `${prefix}_${Date.now().toString(36)}_${idCounter++}`;

// ---------------------------------------------------------------------------
// Seed data - mirrors the source price-schedule spreadsheet so the component
// renders something meaningful out of the box. Replace with your own data,
// or pass an `initialSchedule` prop (see README.md).
// ---------------------------------------------------------------------------
const SEED_TONNAGE_RANGES = [
  { id: 't_0_2', min: 0, max: 2 },
  { id: 't_3_5', min: 3, max: 5 },
  { id: 't_6_10', min: 6, max: 10 },
  { id: 't_11_15', min: 11, max: 15 },
  { id: 't_16_20', min: 16, max: 20 },
  { id: 't_21_25', min: 21, max: 25 },
];

const SEED_DISTANCE_RANGES = [
  { id: 'd_0_40', min: 0, max: 40, noUpperLimit: false },
  { id: 'd_41_100', min: 41, max: 100, noUpperLimit: false },
  { id: 'd_101_150', min: 101, max: 150, noUpperLimit: false },
  { id: 'd_151_200', min: 151, max: 200, noUpperLimit: false },
  { id: 'd_201_300', min: 201, max: 300, noUpperLimit: false },
  { id: 'd_301_400', min: 301, max: 400, noUpperLimit: false },
  { id: 'd_401_600', min: 401, max: 600, noUpperLimit: false },
  { id: 'd_601_up', min: 601, max: null, noUpperLimit: true },
];

// [distanceRangeId, tonnageRangeId, minPrice, maxPrice] - flat, list-shaped from the start.
const SEED_RATES = [
  ['d_0_40', 't_0_2', 2220, 2664], ['d_0_40', 't_3_5', 1120, 1344], ['d_0_40', 't_6_10', 920, 1104],
  ['d_0_40', 't_11_15', 820, 984], ['d_0_40', 't_16_20', 620, 744], ['d_0_40', 't_21_25', 520, 624],

  ['d_41_100', 't_0_2', 1150, 1380], ['d_41_100', 't_3_5', 1120, 1344], ['d_41_100', 't_6_10', 820, 984],
  ['d_41_100', 't_11_15', 720, 864], ['d_41_100', 't_16_20', 520, 624], ['d_41_100', 't_21_25', 470, 564],

  ['d_101_150', 't_0_2', 1060, 1272], ['d_101_150', 't_3_5', 620, 744], ['d_101_150', 't_6_10', 570, 684],
  ['d_101_150', 't_11_15', 570, 684], ['d_101_150', 't_16_20', 420, 504], ['d_101_150', 't_21_25', 400, 480],

  ['d_151_200', 't_0_2', 1060, 1272], ['d_151_200', 't_3_5', 590, 708], ['d_151_200', 't_6_10', 490, 588],
  ['d_151_200', 't_11_15', 490, 588], ['d_151_200', 't_16_20', 400, 480], ['d_151_200', 't_21_25', 380, 456],

  ['d_201_300', 't_0_2', 970, 1164], ['d_201_300', 't_3_5', 560, 672], ['d_201_300', 't_6_10', 470, 564],
  ['d_201_300', 't_11_15', 470, 564], ['d_201_300', 't_16_20', 400, 480], ['d_201_300', 't_21_25', 370, 444],

  ['d_301_400', 't_0_2', 970, 1164], ['d_301_400', 't_3_5', 490, 588], ['d_301_400', 't_6_10', 450, 540],
  ['d_301_400', 't_11_15', 450, 540], ['d_301_400', 't_16_20', 370, 444], ['d_301_400', 't_21_25', 340, 408],

  ['d_401_600', 't_0_2', 920, 1104], ['d_401_600', 't_3_5', 470, 564], ['d_401_600', 't_6_10', 420, 504],
  ['d_401_600', 't_11_15', 420, 504], ['d_401_600', 't_16_20', 370, 444], ['d_401_600', 't_21_25', 340, 408],

  ['d_601_up', 't_0_2', 720, 864], ['d_601_up', 't_3_5', 420, 504], ['d_601_up', 't_6_10', 400, 480],
  ['d_601_up', 't_11_15', 370, 444], ['d_601_up', 't_16_20', 340, 408], ['d_601_up', 't_21_25', 340, 408],
].map(([distanceRangeId, tonnageRangeId, minPrice, maxPrice]) => ({
  distanceRangeId,
  tonnageRangeId,
  minPrice,
  maxPrice,
}));

const SEED_SCHEDULE = {
  tonnageRanges: SEED_TONNAGE_RANGES,
  distanceRanges: SEED_DISTANCE_RANGES,
  rates: SEED_RATES,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the set of bracket ids whose [min,max] interval overlaps another. */
function findOverlapIds(ranges, getMax) {
  const overlapping = new Set();
  const usable = ranges
    .map((r) => ({ id: r.id, min: Number(r.min), max: getMax(r) }))
    .filter((r) => Number.isFinite(r.min) && Number.isFinite(r.max));

  for (let i = 0; i < usable.length; i += 1) {
    for (let j = i + 1; j < usable.length; j += 1) {
      const a = usable[i];
      const b = usable[j];
      if (a.min <= b.max && b.min <= a.max) {
        overlapping.add(a.id);
        overlapping.add(b.id);
      }
    }
  }
  return overlapping;
}

const rateKey = (distanceRangeId, tonnageRangeId) => `${distanceRangeId}__${tonnageRangeId}`;

function tonnageLabel(t) {
  return `${t.min} - ${t.max} MT`;
}

function distanceLabel(d) {
  return d.noUpperLimit ? `${d.min}+ km` : `${d.min} - ${d.max} km`;
}

function formatUgx(value) {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return '—';
  return `UGX ${Number(value).toLocaleString()}`;
}

/** Sorts a column's value numerically by reading the leading number out of a label string. */
function numericLeadingSort(rowA, rowB, columnId) {
  const a = parseFloat(rowA.getValue(columnId));
  const b = parseFloat(rowB.getValue(columnId));
  return (Number.isNaN(a) ? 0 : a) - (Number.isNaN(b) ? 0 : b);
}

function scheduleToFormValues(schedule) {
  return {
    tonnageRanges: schedule.tonnageRanges,
    distanceRanges: schedule.distanceRanges,
    rates: schedule.rates,
  };
}

/** Sorts both axes by min value, drops orphaned rates, and returns the clean save payload. */
function buildScheduleFromForm(data) {
  const tonnageRanges = [...data.tonnageRanges]
    .map((t) => ({ ...t, min: Number(t.min), max: Number(t.max) }))
    .sort((a, b) => a.min - b.min);

  const distanceRanges = [...data.distanceRanges]
    .map((d) => ({
      ...d,
      min: Number(d.min),
      max: d.noUpperLimit ? null : Number(d.max),
    }))
    .sort((a, b) => a.min - b.min);

  const tonnageIds = new Set(tonnageRanges.map((t) => t.id));
  const distanceIds = new Set(distanceRanges.map((d) => d.id));
  const distanceOrder = new Map(distanceRanges.map((d, i) => [d.id, i]));
  const tonnageOrder = new Map(tonnageRanges.map((t, i) => [t.id, i]));

  const rates = data.rates
    .filter((r) => distanceIds.has(r.distanceRangeId) && tonnageIds.has(r.tonnageRangeId))
    .map((r) => ({
      distanceRangeId: r.distanceRangeId,
      tonnageRangeId: r.tonnageRangeId,
      minPrice: Number(r.minPrice),
      maxPrice: Number(r.maxPrice),
    }))
    .sort(
      (a, b) =>
        distanceOrder.get(a.distanceRangeId) - distanceOrder.get(b.distanceRangeId) ||
        tonnageOrder.get(a.tonnageRangeId) - tonnageOrder.get(b.tonnageRangeId),
    );

  return { tonnageRanges, distanceRanges, rates };
}

/**
 * Converts the in-memory schedule into flat rows for the `distance_tonnage_rates`
 * table - bracket bounds inlined into every row, no ids, no joins. This is
 * what you bulk insert/upsert.
 */
function toDbRows(schedule) {
  const distanceById = new Map(schedule.distanceRanges.map((d) => [d.id, d]));
  const tonnageById = new Map(schedule.tonnageRanges.map((t) => [t.id, t]));

  return schedule.rates.map((r) => {
    const d = distanceById.get(r.distanceRangeId);
    const t = tonnageById.get(r.tonnageRangeId);
    return {
      distance_min: d.min,
      distance_max: d.noUpperLimit ? null : d.max,
      distance_no_upper_limit: d.noUpperLimit,
      tonnage_min: t.min,
      tonnage_max: t.max,
      min_price: r.minPrice,
      max_price: r.maxPrice,
    };
  });
}

/**
 * Reverse of toDbRows: given rows queried back from `distance_tonnage_rates`,
 * deduplicates distinct distance bounds and tonnage bounds into bracket lists
 * (generating fresh client-side ids for them) and rebuilds the `rates` list -
 * i.e. reconstructs the editing-model schedule from flat DB rows.
 */
function fromDbRows(rows) {
  const distanceByKey = new Map();
  const tonnageByKey = new Map();

  rows.forEach((row) => {
    const dKey = `${row.distance_min}_${row.distance_max}_${row.distance_no_upper_limit}`;
    if (!distanceByKey.has(dKey)) {
      distanceByKey.set(dKey, {
        id: makeId('d'),
        min: Number(row.distance_min),
        max: row.distance_no_upper_limit ? null : Number(row.distance_max),
        noUpperLimit: Boolean(row.distance_no_upper_limit),
      });
    }
    const tKey = `${row.tonnage_min}_${row.tonnage_max}`;
    if (!tonnageByKey.has(tKey)) {
      tonnageByKey.set(tKey, {
        id: makeId('t'),
        min: Number(row.tonnage_min),
        max: Number(row.tonnage_max),
      });
    }
  });

  const distanceRanges = [...distanceByKey.values()].sort((a, b) => a.min - b.min);
  const tonnageRanges = [...tonnageByKey.values()].sort((a, b) => a.min - b.min);

  const rates = rows.map((row) => {
    const dKey = `${row.distance_min}_${row.distance_max}_${row.distance_no_upper_limit}`;
    const tKey = `${row.tonnage_min}_${row.tonnage_max}`;
    return {
      distanceRangeId: distanceByKey.get(dKey).id,
      tonnageRangeId: tonnageByKey.get(tKey).id,
      minPrice: Number(row.min_price),
      maxPrice: Number(row.max_price),
    };
  });

  return { tonnageRanges, distanceRanges, rates };
}

const columnHelper = createColumnHelper();

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DistancePricingScheduleForm({ initialSchedule = SEED_SCHEDULE, onSave }) {
  const [mode, setMode] = useState('view'); // 'view' | 'edit'
  const [submittedSchedule, setSubmittedSchedule] = useState(initialSchedule);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: scheduleToFormValues(initialSchedule),
    mode: 'onBlur',
  });

  // keyName avoids RHF overwriting our own domain `id` field on each array item.
  const tonnageArray = useFieldArray({ control, name: 'tonnageRanges', keyName: 'fieldKey' });
  const distanceArray = useFieldArray({ control, name: 'distanceRanges', keyName: 'fieldKey' });
  const ratesArray = useFieldArray({ control, name: 'rates', keyName: 'fieldKey' });

  const watchedTonnage = watch('tonnageRanges');
  const watchedDistance = watch('distanceRanges');

  const tonnageIdsKey = watchedTonnage.map((t) => t.id).join(',');
  const distanceIdsKey = watchedDistance.map((d) => d.id).join(',');

  // Live overlap detection - drives inline warnings and disables Save.
  const tonnageOverlapIds = useMemo(
    () => findOverlapIds(watchedTonnage, (t) => Number(t.max)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(watchedTonnage)],
  );
  const distanceOverlapIds = useMemo(
    () => findOverlapIds(watchedDistance, (d) => (d.noUpperLimit ? Infinity : Number(d.max))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(watchedDistance)],
  );
  const openEndedCount = watchedDistance.filter((d) => d.noUpperLimit).length;
  const hasBlockingErrors = tonnageOverlapIds.size > 0 || distanceOverlapIds.size > 0 || openEndedCount > 1;

  // Whenever a bracket is added/removed, keep `rates` in sync: drop entries
  // whose bracket no longer exists, append entries for new combinations.
  // Surgical add/remove (not a full replace) so untouched rows keep their
  // identity and don't lose focus/remount while the user is mid-edit.
  useEffect(() => {
    const current = getValues('rates') || [];
    const validKeys = new Set();
    watchedDistance.forEach((d) => watchedTonnage.forEach((t) => validKeys.add(rateKey(d.id, t.id))));

    for (let i = current.length - 1; i >= 0; i -= 1) {
      if (!validKeys.has(rateKey(current[i].distanceRangeId, current[i].tonnageRangeId))) {
        ratesArray.remove(i);
      }
    }

    const existingKeys = new Set(
      (getValues('rates') || []).map((r) => rateKey(r.distanceRangeId, r.tonnageRangeId)),
    );
    const toAppend = [];
    watchedDistance.forEach((d) => {
      watchedTonnage.forEach((t) => {
        const key = rateKey(d.id, t.id);
        if (!existingKeys.has(key)) {
          toAppend.push({ distanceRangeId: d.id, tonnageRangeId: t.id, minPrice: '', maxPrice: '' });
        }
      });
    });
    if (toAppend.length) ratesArray.append(toAppend);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tonnageIdsKey, distanceIdsKey]);

  const lastTonnageMax = Number(watchedTonnage[watchedTonnage.length - 1]?.max ?? -1);
  const lastDistanceOpenEnded = Boolean(watchedDistance[watchedDistance.length - 1]?.noUpperLimit);

  const addTonnageRange = () => {
    const nextMin = Math.min(lastTonnageMax + 1, MAX_TONNAGE);
    tonnageArray.append({ id: makeId('t'), min: nextMin, max: MAX_TONNAGE });
  };

  const addDistanceRange = () => {
    const last = watchedDistance[watchedDistance.length - 1];
    const nextMin = last ? Number(last.max ?? last.min) + 1 : 0;
    distanceArray.append({ id: makeId('d'), min: nextMin, max: nextMin + 50, noUpperLimit: false });
  };

  const onSubmit = (data) => {
    if (hasBlockingErrors) return;
    const schedule = buildScheduleFromForm(data);
    setSubmittedSchedule(schedule);
    setMode('view');
    if (onSave) onSave(toDbRows(schedule), schedule);
  };

  const handleEditClick = () => {
    reset(scheduleToFormValues(submittedSchedule));
    setMode('edit');
  };

  const handleCancelClick = () => {
    reset(scheduleToFormValues(submittedSchedule));
    setMode('view');
  };

  const handleExportClick = () => {
    // This is exactly the row payload you'd bulk insert/upsert into
    // `distance_tonnage_rates` - flat, bounds inlined, no foreign keys.
    const rows = toDbRows(submittedSchedule);
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'distance_tonnage_rates.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------------------------------------------------------------------
  // Grid view: pivot the flat `rates` list into a spreadsheet-style table
  // (two rows - Min / Max - per distance bracket, one column per tonnage
  // bracket). Built with @tanstack/react-table; column show/hide is wired
  // up as a real table feature.
  // ---------------------------------------------------------------------
  const gridData = useMemo(() => {
    const rateMap = new Map(
      submittedSchedule.rates.map((r) => [rateKey(r.distanceRangeId, r.tonnageRangeId), r]),
    );
    const rows = [];
    submittedSchedule.distanceRanges.forEach((d) => {
      const minRow = { id: `${d.id}-min`, distance: distanceLabel(d), rowType: 'min', cells: {} };
      const maxRow = { id: `${d.id}-max`, distance: '', rowType: 'max', cells: {} };
      submittedSchedule.tonnageRanges.forEach((t) => {
        const rate = rateMap.get(rateKey(d.id, t.id));
        minRow.cells[t.id] = rate ? rate.minPrice : null;
        maxRow.cells[t.id] = rate ? rate.maxPrice : null;
      });
      rows.push(minRow, maxRow);
    });
    return rows;
  }, [submittedSchedule]);

  const gridColumns = useMemo(
    () => [
      columnHelper.accessor('distance', {
        id: 'distance',
        header: 'Distance (KM)',
        cell: (info) => <span className="font-semibold text-slate-700">{info.getValue()}</span>,
      }),
      ...submittedSchedule.tonnageRanges.map((t) =>
        columnHelper.accessor((row) => row.cells[t.id], {
          id: t.id,
          header: tonnageLabel(t),
          cell: (info) => formatUgx(info.getValue()),
        }),
      ),
    ],
    [submittedSchedule.tonnageRanges],
  );

  const gridTable = useReactTable({
    data: gridData,
    columns: gridColumns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  // ---------------------------------------------------------------------
  // List view: `rates` fed straight into the table - no transformation -
  // this is the "optimized for table display" payoff. Sortable + searchable.
  // ---------------------------------------------------------------------
  const distanceLabelById = useMemo(
    () => new Map(submittedSchedule.distanceRanges.map((d) => [d.id, distanceLabel(d)])),
    [submittedSchedule.distanceRanges],
  );
  const tonnageLabelById = useMemo(
    () => new Map(submittedSchedule.tonnageRanges.map((t) => [t.id, tonnageLabel(t)])),
    [submittedSchedule.tonnageRanges],
  );

  const listColumns = useMemo(
    () => [
      columnHelper.accessor((r) => distanceLabelById.get(r.distanceRangeId) ?? r.distanceRangeId, {
        id: 'distance',
        header: 'Distance (KM)',
        sortingFn: numericLeadingSort,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((r) => tonnageLabelById.get(r.tonnageRangeId) ?? r.tonnageRangeId, {
        id: 'tonnage',
        header: 'Tonnage (MT)',
        sortingFn: numericLeadingSort,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('minPrice', {
        id: 'minPrice',
        header: 'Min price',
        cell: (info) => formatUgx(info.getValue()),
      }),
      columnHelper.accessor('maxPrice', {
        id: 'maxPrice',
        header: 'Max price',
        cell: (info) => formatUgx(info.getValue()),
      }),
    ],
    [distanceLabelById, tonnageLabelById],
  );

  const listTable = useReactTable({
    data: submittedSchedule.rates, // <-- straight from the payload, no shaping needed
    columns: listColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Price schedule</h1>
          <p className="text-sm text-slate-500">
            Rates by distance and tonnage bracket. Tonnage is capped at {MAX_TONNAGE} MT, and neither axis may overlap itself.
          </p>
        </div>
        {mode === 'view' && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportClick}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Export JSON
            </button>
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Pencil className="h-4 w-4" /> Edit schedule
            </button>
          </div>
        )}
      </header>

      {mode === 'view' && (
        <SchedulePanel
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          gridTable={gridTable}
          listTable={listTable}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      )}

      {mode === 'edit' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <BracketCard
              title="Tonnage brackets"
              hint={`Weight ranges in metric tonnes (MT), capped at ${MAX_TONNAGE} MT.`}
              fields={tonnageArray.fields}
              overlapIds={tonnageOverlapIds}
              onAdd={addTonnageRange}
              onRemove={tonnageArray.remove}
              addDisabled={lastTonnageMax >= MAX_TONNAGE}
              renderRow={(field, index) => (
                <>
                  <NumberField
                    label="Min (MT)"
                    error={errors.tonnageRanges?.[index]?.min}
                    inputProps={register(`tonnageRanges.${index}.min`, {
                      required: 'Required',
                      valueAsNumber: true,
                      min: { value: 0, message: '≥ 0' },
                      max: { value: MAX_TONNAGE, message: `≤ ${MAX_TONNAGE}` },
                    })}
                  />
                  <NumberField
                    label="Max (MT)"
                    error={errors.tonnageRanges?.[index]?.max}
                    inputProps={register(`tonnageRanges.${index}.max`, {
                      required: 'Required',
                      valueAsNumber: true,
                      max: { value: MAX_TONNAGE, message: `Max is ${MAX_TONNAGE}` },
                      validate: (v) =>
                        Number(v) > Number(getValues(`tonnageRanges.${index}.min`)) || 'Must be > min',
                    })}
                  />
                </>
              )}
            />

            <BracketCard
              title="Distance brackets"
              hint="Distance ranges in kilometres (KM). The last bracket can be open-ended."
              fields={distanceArray.fields}
              overlapIds={distanceOverlapIds}
              onAdd={addDistanceRange}
              onRemove={distanceArray.remove}
              addDisabled={lastDistanceOpenEnded}
              renderRow={(field, index) => {
                const isOpenEnded = watchedDistance[index]?.noUpperLimit;
                return (
                  <>
                    <NumberField
                      label="Min (KM)"
                      error={errors.distanceRanges?.[index]?.min}
                      inputProps={register(`distanceRanges.${index}.min`, {
                        required: 'Required',
                        valueAsNumber: true,
                        min: { value: 0, message: '≥ 0' },
                      })}
                    />
                    <NumberField
                      label="Max (KM)"
                      error={errors.distanceRanges?.[index]?.max}
                      disabled={isOpenEnded}
                      inputProps={register(`distanceRanges.${index}.max`, {
                        validate: (v) => {
                          if (getValues(`distanceRanges.${index}.noUpperLimit`)) return true;
                          if (v === '' || v === undefined || Number.isNaN(Number(v))) return 'Required';
                          return (
                            Number(v) > Number(getValues(`distanceRanges.${index}.min`)) || 'Must be > min'
                          );
                        },
                      })}
                    />
                    <label className="mt-4 flex shrink-0 flex-col items-center gap-1 text-[10px] font-medium uppercase text-slate-400">
                      Open-ended
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        {...register(`distanceRanges.${index}.noUpperLimit`)}
                      />
                    </label>
                  </>
                );
              }}
            />
          </div>

          <PriceGridCard
            distanceRanges={watchedDistance}
            tonnageRanges={watchedTonnage}
            ratesFields={ratesArray.fields}
            register={register}
            getValues={getValues}
            errors={errors}
          />

          <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="min-h-[1rem]">
              {openEndedCount > 1 && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                  <AlertTriangle className="h-4 w-4" /> Only one distance bracket can be open-ended.
                </p>
              )}
              {openEndedCount <= 1 && hasBlockingErrors && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                  <AlertTriangle className="h-4 w-4" /> Fix the highlighted overlapping ranges before saving.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelClick}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                type="submit"
                disabled={hasBlockingErrors}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <CheckCircle2 className="h-4 w-4" /> Save schedule
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NumberField({ label, error, inputProps, disabled }) {
  return (
    <div className="flex-1">
      <label className="block text-[10px] font-medium uppercase text-slate-400">{label}</label>
      <input
        type="number"
        step="1"
        disabled={disabled}
        {...inputProps}
        className={`w-full rounded-md border px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-1 ${
          disabled
            ? 'border-slate-200 bg-slate-100 text-slate-400'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
        }`}
      />
      {error && <p className="mt-0.5 text-[11px] text-rose-600">{error.message}</p>}
    </div>
  );
}

function BracketCard({ title, hint, fields, overlapIds, onAdd, onRemove, addDisabled, renderRow }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
          <p className="text-xs text-slate-400">{hint}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={addDisabled}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => {
          const hasOverlap = overlapIds.has(field.id);
          return (
            <div
              key={field.fieldKey}
              className={`flex items-end gap-2 rounded-lg border p-2 ${
                hasOverlap ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
              }`}
            >
              {renderRow(field, index)}
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={fields.length === 1}
                className="mb-0.5 shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Remove bracket"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {overlapIds.size > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-rose-600">
          <AlertTriangle className="h-3.5 w-3.5" /> Highlighted brackets overlap - adjust min/max so ranges don&apos;t intersect.
        </p>
      )}
    </section>
  );
}

function PriceGridCard({ distanceRanges, tonnageRanges, ratesFields, register, getValues, errors }) {
  // Index lookup into the `rates` field array by (distanceRangeId, tonnageRangeId).
  const indexByKey = {};
  ratesFields.forEach((r, i) => {
    indexByKey[rateKey(r.distanceRangeId, r.tonnageRangeId)] = i;
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Price grid</h2>
        <p className="text-xs text-slate-400">
          Each cell holds a price range for that distance x tonnage bracket -{' '}
          <span className="font-medium text-slate-600">Min</span> on top,{' '}
          <span className="font-medium text-amber-700">Max</span> (highlighted, must be ≥ Min) below.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Distance (KM)
              </th>
              {tonnageRanges.map((t) => (
                <th
                  key={t.id}
                  className="whitespace-nowrap border-b border-l border-slate-200 bg-slate-50 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                >
                  {tonnageLabel(t)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {distanceRanges.map((d, dIndex) => (
              <tr key={d.id} className={dIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                <td className="sticky left-0 z-10 whitespace-nowrap border-b border-slate-200 bg-inherit px-3 py-2 text-xs font-medium text-slate-600">
                  {distanceLabel(d)}
                </td>
                {tonnageRanges.map((t) => {
                  const key = rateKey(d.id, t.id);
                  const idx = indexByKey[key];
                  if (idx === undefined) {
                    // Bracket was just added this render; the sync effect appends
                    // its rate entries right after - this cell fills in next render.
                    return (
                      <td key={t.id} className="border-b border-l border-slate-200 px-2 py-2 text-center align-middle">
                        <span className="text-[10px] text-slate-300">syncing…</span>
                      </td>
                    );
                  }
                  const cellError = errors.rates?.[idx];
                  return (
                    <td key={t.id} className="border-b border-l border-slate-200 px-2 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <input
                          type="number"
                          step="1"
                          placeholder="Min"
                          {...register(`rates.${idx}.minPrice`, {
                            required: 'Required',
                            valueAsNumber: true,
                            min: { value: 0, message: '≥ 0' },
                          })}
                          className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs tabular-nums focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="number"
                          step="1"
                          placeholder="Max"
                          {...register(`rates.${idx}.maxPrice`, {
                            required: 'Required',
                            valueAsNumber: true,
                            min: { value: 0, message: '≥ 0' },
                            validate: (v) =>
                              Number(v) >= Number(getValues(`rates.${idx}.minPrice`)) || '≥ Min',
                          })}
                          className="w-24 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs tabular-nums focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        {(cellError?.minPrice || cellError?.maxPrice) && (
                          <p className="text-[10px] leading-tight text-rose-600">
                            {cellError.minPrice?.message || cellError.maxPrice?.message}
                          </p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SchedulePanel({ viewMode, onViewModeChange, gridTable, listTable, globalFilter, onGlobalFilterChange }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Published schedule</h2>
          <p className="text-xs text-slate-400">Rates are VAT exclusive.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                viewMode === 'list' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              List
            </button>
          </div>

          {viewMode === 'grid' && (
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 p-1">
              {gridTable
                .getAllLeafColumns()
                .filter((col) => col.id !== 'distance')
                .map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={col.getToggleVisibilityHandler()}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${
                      col.getIsVisible() ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {col.getIsVisible() ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {col.columnDef.header}
                  </button>
                ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={globalFilter}
                onChange={(e) => onGlobalFilterChange(e.target.value)}
                placeholder="Search distance, tonnage…"
                className="rounded-lg border border-slate-300 py-1.5 pl-7 pr-3 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      {viewMode === 'grid' ? <GridTable table={gridTable} /> : <ListTable table={listTable} />}

      <p className="mt-3 text-xs italic text-slate-400">
        For Kampala-Wakiso, a retainer fee of UGX 4,500,000 (VAT exclusive) applies for a radius of 10km from JMS.
      </p>
    </section>
  );
}

function GridTable({ table }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={row.original.rowType === 'max' ? 'bg-amber-50' : 'bg-white'}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border-b border-slate-100 px-3 py-2 tabular-nums">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListTable({ table }) {
  const columnCount = table.getAllLeafColumns().length;
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer select-none whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-100"
                >
                  <span className="inline-flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <SortIcon direction={header.column.getIsSorted()} />
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="odd:bg-white even:bg-slate-50/60">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border-b border-slate-100 px-3 py-2 tabular-nums">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="px-3 py-6 text-center text-xs text-slate-400">
                No rates match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ direction }) {
  if (direction === 'asc') return <ArrowUp className="h-3 w-3" />;
  if (direction === 'desc') return <ArrowDown className="h-3 w-3" />;
  return <ArrowUpDown className="h-3 w-3 text-slate-300" />;
}

// Exported so callers can convert outside the component too - e.g. converting
// an API response into `initialSchedule`, or converting a schedule into rows
// for a bulk insert without waiting for the user to click Save.
export { toDbRows, fromDbRows };