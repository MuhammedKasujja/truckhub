/**
 * PriceScheduleForm
 * ------------------
 * A dynamic distance x tonnage price-schedule editor.
 *
 * - Tonnage brackets and distance brackets are both fully dynamic (add / remove).
 * - Every (distance bracket x tonnage bracket) cell holds a Min price and a Max price.
 * - Neither axis may contain overlapping ranges (validated live, blocks saving).
 * - Tonnage is hard-capped at 30 MT.
 * - The saved schedule is rendered as a pivot table with @tanstack/react-table
 *   (column show/hide is wired up as a real table feature, not just decoration).
 *
 * Peer dependencies (install in your app):
 *   npm i react-hook-form @tanstack/react-table lucide-react
 *
 * Tailwind CSS is used for styling. If you're not on Tailwind, swap the
 * className strings for your own styles - the structure/logic is unaffected.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  useReactTable,
  getCoreRowModel,
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
// or pass an `initialSchedule` prop (see bottom of file).
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

// [distanceId, tonnageId, minPrice, maxPrice]
const SEED_PRICE_ROWS = [
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
];

const SEED_PRICES = SEED_PRICE_ROWS.reduce((acc, [distanceId, tonnageId, minPrice, maxPrice]) => {
  acc[`${distanceId}__${tonnageId}`] = { minPrice, maxPrice };
  return acc;
}, {});

const SEED_SCHEDULE = {
  tonnageRanges: SEED_TONNAGE_RANGES,
  distanceRanges: SEED_DISTANCE_RANGES,
  prices: SEED_PRICES,
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

function scheduleToFormValues(schedule) {
  return {
    tonnageRanges: schedule.tonnageRanges,
    distanceRanges: schedule.distanceRanges,
    prices: schedule.prices,
  };
}

/** Sorts both axes by their min value and returns a clean schedule object. */
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

  // Only keep prices for combinations that currently exist.
  const prices = {};
  distanceRanges.forEach((d) => {
    tonnageRanges.forEach((t) => {
      const key = `${d.id}__${t.id}`;
      const entry = data.prices?.[key];
      if (entry) {
        prices[key] = {
          minPrice: Number(entry.minPrice),
          maxPrice: Number(entry.maxPrice),
        };
      }
    });
  });

  return { tonnageRanges, distanceRanges, prices };
}

const columnHelper = createColumnHelper();

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PriceScheduleForm({ initialSchedule = SEED_SCHEDULE }) {
  const [mode, setMode] = useState('view'); // 'view' | 'edit'
  const [submittedSchedule, setSubmittedSchedule] = useState(initialSchedule);
  const [columnVisibility, setColumnVisibility] = useState({});

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: scheduleToFormValues(initialSchedule),
    mode: 'onBlur',
  });

  // keyName avoids RHF overwriting our own domain `id` field on each array item.
  const tonnageArray = useFieldArray({ control, name: 'tonnageRanges', keyName: 'fieldKey' });
  const distanceArray = useFieldArray({ control, name: 'distanceRanges', keyName: 'fieldKey' });

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

  // Whenever a bracket is added/removed, make sure every (distance x tonnage)
  // cell has a price entry to register against, without clobbering existing values.
  useEffect(() => {
    const currentPrices = getValues('prices') || {};
    const next = { ...currentPrices };
    let changed = false;
    watchedDistance.forEach((d) => {
      watchedTonnage.forEach((t) => {
        const key = `${d.id}__${t.id}`;
        if (!next[key]) {
          next[key] = { minPrice: '', maxPrice: '' };
          changed = true;
        }
      });
    });
    if (changed) setValue('prices', next, { shouldDirty: false });
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
    const blob = new Blob([JSON.stringify(submittedSchedule, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'price-schedule.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------------------------------------------------------------------
  // Pivot table for the saved schedule (two rows per distance bracket:
  // Min and Max), built with @tanstack/react-table.
  // ---------------------------------------------------------------------
  const tableData = useMemo(() => {
    const rows = [];
    submittedSchedule.distanceRanges.forEach((d) => {
      const minRow = { id: `${d.id}-min`, distance: distanceLabel(d), rowType: 'min', prices: {} };
      const maxRow = { id: `${d.id}-max`, distance: '', rowType: 'max', prices: {} };
      submittedSchedule.tonnageRanges.forEach((t) => {
        const entry = submittedSchedule.prices[`${d.id}__${t.id}`];
        minRow.prices[t.id] = entry ? entry.minPrice : null;
        maxRow.prices[t.id] = entry ? entry.maxPrice : null;
      });
      rows.push(minRow, maxRow);
    });
    return rows;
  }, [submittedSchedule]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('distance', {
        id: 'distance',
        header: 'Distance (KM)',
        cell: (info) => <span className="font-semibold text-slate-700">{info.getValue()}</span>,
      }),
      ...submittedSchedule.tonnageRanges.map((t) =>
        columnHelper.accessor((row) => row.prices[t.id], {
          id: t.id,
          header: tonnageLabel(t),
          cell: (info) => formatUgx(info.getValue()),
        }),
      ),
    ],
    [submittedSchedule.tonnageRanges],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-5">
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
        <ScheduleTable table={table} columnVisibility={columnVisibility} />
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

function PriceGridCard({ distanceRanges, tonnageRanges, register, getValues, errors }) {
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
                  const key = `${d.id}__${t.id}`;
                  const cellError = errors.prices?.[key];
                  return (
                    <td key={t.id} className="border-b border-l border-slate-200 px-2 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <input
                          type="number"
                          step="1"
                          placeholder="Min"
                          {...register(`prices.${key}.minPrice`, {
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
                          {...register(`prices.${key}.maxPrice`, {
                            required: 'Required',
                            valueAsNumber: true,
                            min: { value: 0, message: '≥ 0' },
                            validate: (v) =>
                              Number(v) >= Number(getValues(`prices.${key}.minPrice`)) || '≥ Min',
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

function ScheduleTable({ table, columnVisibility }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Published schedule</h2>
          <p className="text-xs text-slate-400">Rates are VAT exclusive.</p>
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 p-1">
          {table
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
      </div>

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
              <tr
                key={row.id}
                className={row.original.rowType === 'max' ? 'bg-amber-50' : 'bg-white'}
              >
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

      <p className="mt-3 text-xs italic text-slate-400">
        For Kampala-Wakiso, a retainer fee of UGX 4,500,000 (VAT exclusive) applies for a radius of 10km from JMS.
      </p>
    </section>
  );
}