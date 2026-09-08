import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Truck } from "lucide-react";
import { RoutePricing } from "../../types";

// Range filter: column value must fall within [min, max] of the filter tuple.
// Used for the Distance column (row.distance_km) directly.
const rangeFilterFn = (row, columnId, filterValue) => {
  const [min, max] = filterValue ?? [];
  const value = row.getValue(columnId);
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
};

// Overlap filter: row's [min_hrs, max_hrs] duration window must overlap the
// filter's [min, max] window. Used for the Duration column.
const durationOverlapFilterFn = (row, _columnId, filterValue) => {
  const [min, max] = filterValue ?? [];
  const { min_hrs, max_hrs } = row.original;
  if (min != null && max_hrs < min) return false;
  if (max != null && min_hrs > max) return false;
  return true;
};

const fmtUGX = (n) => n.toLocaleString("en-UG");

// Sample data used only when no `routes` prop is passed, so the component
// still renders standalone. Pass your own `routes` array to reuse it elsewhere.
const SAMPLE_ROUTES = [
  { origin: "Kampala", destination: "Kabale", distance_km: 410, min_hrs: 36, max_hrs: 48,
    pricings: [ { min_tons: 2, max_tons: 5, price: 450000 }, { min_tons: 6, max_tons: 10, price: 520000 }, { min_tons: 11, max_tons: 14, price: 550000 }, { min_tons: 15, max_tons: 19, price: 600000 } ] },
  { origin: "Kampala", destination: "Gulu", distance_km: 340, min_hrs: 24, max_hrs: 36,
    pricings: [ { min_tons: 2, max_tons: 5, price: 530000 }, { min_tons: 6, max_tons: 10, price: 570000 }, { min_tons: 11, max_tons: 14, price: 620000 }, { min_tons: 15, max_tons: 19, price: 650000 } ] },
  { origin: "Kampala", destination: "Mpondwe", distance_km: 440, min_hrs: 36, max_hrs: 48,
    pricings: [ { min_tons: 2, max_tons: 5, price: 570000 }, { min_tons: 6, max_tons: 10, price: 635000 }, { min_tons: 11, max_tons: 14, price: 670000 }, { min_tons: 15, max_tons: 19, price: 700000 } ] },
  { origin: "Kampala", destination: "Kisoro", distance_km: 480, min_hrs: 36, max_hrs: 48,
    pricings: [ { min_tons: 2, max_tons: 5, price: 610000 }, { min_tons: 6, max_tons: 10, price: 650000 }, { min_tons: 11, max_tons: 14, price: 690000 }, { min_tons: 15, max_tons: 19, price: 759000 } ] },
];

type Props ={
  title: string,
  routes: RoutePricing[],
  effectiveDate: string,
  subtitle?: string
}


export function RouteTonnagePricingGrid({
  routes = SAMPLE_ROUTES,
  effectiveDate,
  title = "Cargo route rates",
  subtitle,
}: Props) {
  const [sorting, setSorting] = useState([{ id: "destination", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [distMin, setDistMin] = useState("");
  const [distMax, setDistMax] = useState("");
  const [durMin, setDurMin] = useState("");
  const [durMax, setDurMax] = useState("");

  // Union of tonnage brackets across all routes, in case different routes
  // in a dataset offer different brackets.
  const tonKeys = useMemo(() => {
    const set = new Set();
    routes.forEach((r) => (r.pricings || []).forEach((p) => set.add(`${p.min_tons}-${p.max_tons}`)));
    return Array.from(set).sort((a, b) => {
      const [aMin] = a.split("-").map(Number);
      const [bMin] = b.split("-").map(Number);
      return aMin - bMin;
    });
  }, [routes]);

  // Pivot: one row per route, one column per tonnage bracket
  const data = useMemo(
    () =>
      routes.map((r) => {
        const row = {
          origin: r.origin,
          destination: r.destination,
          distance_km: r.distance_km,
          min_hrs: r.min_hrs,
          max_hrs: r.max_hrs,
        };
        (r.pricings || []).forEach((p) => {
          row[`${p.min_tons}-${p.max_tons}`] = p.price;
        });
        return row;
      }),
    [routes]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "destination",
        header: "Destination",
        cell: (info) => (
          <span className="text-[#F4F7FA]">
            {info.row.original.origin} <span className="text-[#5C6B7A]">→</span> {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "distance_km",
        header: "Distance",
        filterFn: rangeFilterFn,
        cell: (info) => <span className="text-[#B9C4D0]">{info.getValue()} km</span>,
      },
      {
        id: "duration",
        accessorFn: (row) => row.max_hrs, // sort by upper bound of the window
        header: "Duration",
        filterFn: durationOverlapFilterFn,
        cell: (info) => (
          <span className="text-[#B9C4D0]">
            {info.row.original.min_hrs}–{info.row.original.max_hrs} hrs
          </span>
        ),
      },
      ...tonKeys.map((key) => {
        const [min, max] = key.split("-");
        return {
          accessorKey: key,
          header: `${min}–${max}t`,
          cell: (info) => {
            const value = info.getValue();
            return value == null ? (
              <span className="text-[#3E4C5C]">—</span>
            ) : (
              <span className="text-primary font-semibold">{fmtUGX(value)}</span>
            );
          },
        };
      }),
    ],
    [tonKeys]
  );

  const columnFilters = useMemo(
    () => [
      { id: "distance_km", value: [distMin === "" ? null : Number(distMin), distMax === "" ? null : Number(distMax)] },
      { id: "duration", value: [durMin === "" ? null : Number(durMin), durMax === "" ? null : Number(durMax)] },
    ],
    [distMin, distMax, durMin, durMax]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, value) =>
      row.original.destination.toLowerCase().includes(value.toLowerCase()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const clearRangeFilters = () => {
    setDistMin(""); setDistMax(""); setDurMin(""); setDurMax("");
  };

  return (
    <div className="w-full bg-[#0F1720] text-[#E7ECF2] rounded-xl border border-[#233041] font-mono text-[13px]">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-[#233041]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Truck size={16} className="text-[#0F1720]" />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-[#F4F7FA] leading-none">{title}</div>
            {(effectiveDate || subtitle) && (
              <div className="text-[11px] text-[#7C8B9C] mt-1">
                {effectiveDate && <>Effective {effectiveDate}</>}
                {effectiveDate && subtitle && " · "}
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <div className="text-[11px] text-[#7C8B9C] hidden sm:block">
          {table.getRowModel().rows.length} of {data.length} routes
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-[#233041] bg-[#111B26]">
        <div className="flex items-center gap-2 bg-[#0F1720] border border-[#2B3A4C] rounded-md px-2.5 py-1.5">
          <Search size={13} className="text-[#5C6B7A] shrink-0" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter destination..."
            className="bg-transparent outline-none text-[12px] w-32 placeholder:text-[#5C6B7A] text-[#E7ECF2]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#0F1720] border border-[#2B3A4C] rounded-md px-2.5 py-1.5">
          <span className="text-[11px] text-[#5C6B7A]">Distance (km)</span>
          <input
            type="number"
            value={distMin}
            onChange={(e) => setDistMin(e.target.value)}
            placeholder="min"
            className="bg-transparent outline-none text-[12px] w-14 placeholder:text-[#5C6B7A] text-[#E7ECF2]"
          />
          <span className="text-[#5C6B7A]">–</span>
          <input
            type="number"
            value={distMax}
            onChange={(e) => setDistMax(e.target.value)}
            placeholder="max"
            className="bg-transparent outline-none text-[12px] w-14 placeholder:text-[#5C6B7A] text-[#E7ECF2]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#0F1720] border border-[#2B3A4C] rounded-md px-2.5 py-1.5">
          <span className="text-[11px] text-[#5C6B7A]">Duration (hrs)</span>
          <input
            type="number"
            value={durMin}
            onChange={(e) => setDurMin(e.target.value)}
            placeholder="min"
            className="bg-transparent outline-none text-[12px] w-14 placeholder:text-[#5C6B7A] text-[#E7ECF2]"
          />
          <span className="text-[#5C6B7A]">–</span>
          <input
            type="number"
            value={durMax}
            onChange={(e) => setDurMax(e.target.value)}
            placeholder="max"
            className="bg-transparent outline-none text-[12px] w-14 placeholder:text-[#5C6B7A] text-[#E7ECF2]"
          />
        </div>

        {(distMin || distMax || durMin || durMax || globalFilter) && (
          <button
            onClick={() => { clearRangeFilters(); setGlobalFilter(""); }}
            className="text-[11px] text-[#D97B2E] hover:underline ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortDir = header.column.getIsSorted();
                  const sortable = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`border-b border-r border-[#233041] px-3 py-2 text-[11px] text-[#7C8B9C] font-medium select-none text-left ${
                        sortable ? "cursor-pointer hover:text-[#E7ECF2]" : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable &&
                          (sortDir === "asc" ? (
                            <ArrowUp size={12} />
                          ) : sortDir === "desc" ? (
                            <ArrowDown size={12} />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-25" />
                          ))}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border-b border-r border-[#1A2531] px-3 py-2 hover:bg-[#141F2B]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-[#5C6B7A] text-[13px]">
                  No routes match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-2.5 text-[10.5px] text-[#5C6B7A] border-t border-[#233041]">
        Sorting, search by location, and range column filters
      </div>
    </div>
  );
}