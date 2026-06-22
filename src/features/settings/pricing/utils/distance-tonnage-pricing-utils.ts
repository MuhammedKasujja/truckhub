import { SortingFn } from "@tanstack/react-table";
import { DistancePricingRequest } from "../schemas";

export const MAX_TONNAGE = 30;

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface TonnageRange {
  id: string;
  min: number;
  max: number;
}

export interface DistanceRange {
  id: string;
  min: number;
  max: number | null; // null when noUpperLimit is true
  noUpperLimit: boolean;
}

export interface RateEntry {
  distanceRangeId: string;
  tonnageRangeId: string;
  minPrice: number;
  maxPrice: number;
}

export interface PriceSchedule {
  tonnageRanges: TonnageRange[];
  distanceRanges: DistanceRange[];
  rates: RateEntry[];
}


/** The pivoted row shape used by the read-only Grid view. */
export interface GridRow {
  id: string;
  distance: string;
  rowType: 'min' | 'max';
  cells: Record<string, number | null>;
}

export type FormValues = PriceSchedule;

export interface PriceScheduleFormProps {
  /** Schedule to start from. Build with `fromDbRows(rows)` to load from your DB. */
  initialSchedule?: PriceSchedule;
  /** Called after a successful save with the DB-ready rows (and the bracket-shaped schedule, if useful). */
  onSave?: (rows: DistancePricingRequest[], schedule: PriceSchedule) => void;
}

// ---------------------------------------------------------------------------
// Id generation - keeps our own stable ids separate from RHF's internal keys.
// ---------------------------------------------------------------------------
let idCounter = 0;
export const makeId = (prefix: string): string => `${prefix}_${Date.now().toString(36)}_${idCounter++}`;

// ---------------------------------------------------------------------------
// Seed data - mirrors the source price-schedule spreadsheet so the component
// renders something meaningful out of the box. Replace with your own data,
// or pass an `initialSchedule` prop (see README.md).
// ---------------------------------------------------------------------------
const SEED_TONNAGE_RANGES: TonnageRange[] = [
  { id: 't_0_2', min: 0, max: 2 },
  { id: 't_3_5', min: 3, max: 5 },
  { id: 't_6_10', min: 6, max: 10 },
  { id: 't_11_15', min: 11, max: 15 },
  { id: 't_16_20', min: 16, max: 20 },
  { id: 't_21_25', min: 21, max: 25 },
];

const SEED_DISTANCE_RANGES: DistanceRange[] = [
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
const SEED_RATES: RateEntry[] = (
  [
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
  ] as Array<[string, string, number, number]>
).map(([distanceRangeId, tonnageRangeId, minPrice, maxPrice]) => ({
  distanceRangeId,
  tonnageRangeId,
  minPrice,
  maxPrice,
}));

export const SEED_SCHEDULE: PriceSchedule = {
  tonnageRanges: SEED_TONNAGE_RANGES,
  distanceRanges: SEED_DISTANCE_RANGES,
  rates: SEED_RATES,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the set of bracket ids whose [min,max] interval overlaps another. */
export function findOverlapIds<T extends { id: string; min: number }>(
  ranges: T[],
  getMax: (r: T) => number,
): Set<string> {
  const overlapping = new Set<string>();
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

export const rateKey = (distanceRangeId: string, tonnageRangeId: string): string =>
  `${distanceRangeId}__${tonnageRangeId}`;

export function tonnageLabel(t: TonnageRange): string {
  return `${t.min} - ${t.max} MT`;
}

export function distanceLabel(d: DistanceRange): string {
  return d.noUpperLimit ? `${d.min}+ km` : `${d.min} - ${d.max} km`;
}

export function formatUgx(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `UGX ${Number(value).toLocaleString()}`;
}

/** Sorts a column's value numerically by reading the leading number out of a label string. */
export const numericLeadingSort: SortingFn<RateEntry> = (rowA, rowB, columnId) => {
  const a = parseFloat(String(rowA.getValue(columnId)));
  const b = parseFloat(String(rowB.getValue(columnId)));
  return (Number.isNaN(a) ? 0 : a) - (Number.isNaN(b) ? 0 : b);
};

export function scheduleToFormValues(schedule: PriceSchedule): FormValues {
  return {
    tonnageRanges: schedule.tonnageRanges,
    distanceRanges: schedule.distanceRanges,
    rates: schedule.rates,
  };
}

/** Sorts both axes by min value, drops orphaned rates, and returns the clean save payload. */
export function buildScheduleFromForm(data: FormValues): PriceSchedule {
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
        (distanceOrder.get(a.distanceRangeId) ?? 0) - (distanceOrder.get(b.distanceRangeId) ?? 0) ||
        (tonnageOrder.get(a.tonnageRangeId) ?? 0) - (tonnageOrder.get(b.tonnageRangeId) ?? 0),
    );

  return { tonnageRanges, distanceRanges, rates };
}

/**
 * Converts the in-memory schedule into flat rows for the `distance_tonnage_rates`
 * table - bracket bounds inlined into every row, no ids, no joins. This is
 * what you bulk insert/upsert.
 */
export function toDbRows(schedule: PriceSchedule): DistancePricingRequest[] {
  const distanceById = new Map(schedule.distanceRanges.map((d) => [d.id, d]));
  const tonnageById = new Map(schedule.tonnageRanges.map((t) => [t.id, t]));

  return schedule.rates.map((r) => {
    const d = distanceById.get(r.distanceRangeId);
    const t = tonnageById.get(r.tonnageRangeId);
    if (!d || !t) {
      throw new Error(`Rate references a bracket that no longer exists: ${r.distanceRangeId} / ${r.tonnageRangeId}`);
    }
    return {
      distance_min_km: d.min,
      distance_max_km: d.noUpperLimit ? null : d.max,
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
export function fromDbRows(rows: DistancePricingRequest[]): PriceSchedule {
  const distanceByKey = new Map<string, DistanceRange>();
  const tonnageByKey = new Map<string, TonnageRange>();

  rows.forEach((row) => {
    const dKey = `${row.distance_min_km}_${row.distance_max_km}_${row.distance_no_upper_limit}`;
    if (!distanceByKey.has(dKey)) {
      distanceByKey.set(dKey, {
        id: makeId('d'),
        min: Number(row.distance_min_km),
        max: row.distance_no_upper_limit ? null : Number(row.distance_max_km),
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

  const rates: RateEntry[] = rows.map((row) => {
    const dKey = `${row.distance_min_km}_${row.distance_max_km}_${row.distance_no_upper_limit}`;
    const tKey = `${row.tonnage_min}_${row.tonnage_max}`;
    const d = distanceByKey.get(dKey) as DistanceRange;
    const t = tonnageByKey.get(tKey) as TonnageRange;
    return {
      distanceRangeId: d.id,
      tonnageRangeId: t.id,
      minPrice: Number(row.min_price),
      maxPrice: Number(row.max_price),
    };
  });

  return { tonnageRanges, distanceRanges, rates };
}

// Exported so callers can convert outside the component too - e.g. converting
// an API response into `initialSchedule`, or converting a schedule into rows
// for a bulk insert without waiting for the user to click Save.
// export { toDbRows, fromDbRows };