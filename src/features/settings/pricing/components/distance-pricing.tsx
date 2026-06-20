'use client';

import { useMemo, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { Plus, Trash2, Save } from 'lucide-react';

const rangeSchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0),
});

const formSchema = z.object({
  distanceRanges: z.array(rangeSchema).min(1),
  tonnageRanges: z.array(rangeSchema).min(1),
  prices: z.record(z.string(), z.record(z.string(), z.number().min(0))),
}).refine((data) => {
  const sortedDist = [...data.distanceRanges].sort((a, b) => a.min - b.min);
  for (let i = 1; i < sortedDist.length; i++) {
    if (sortedDist[i].min <= sortedDist[i - 1].max) return false;
  }
  const sortedTon = [...data.tonnageRanges].sort((a, b) => a.min - b.min);
  for (let i = 1; i < sortedTon.length; i++) {
    if (sortedTon[i].min <= sortedTon[i - 1].max) return false;
  }
  return true;
}, { message: "Ranges must not overlap" })
.refine((data) => data.tonnageRanges.every(r => r.max <= 30), {
  message: "Max tonnage is 30 MT",
});

type FormData = z.infer<typeof formSchema>;

export default function DristancePriceScheduleForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      distanceRanges: [
        { min: 0, max: 40 }, { min: 41, max: 100 }, { min: 101, max: 150 },
        { min: 151, max: 200 }, { min: 201, max: 300 }, { min: 301, max: 400 },
        { min: 401, max: 600 }, { min: 601, max: 9999 },
      ],
      tonnageRanges: [
        { min: 0, max: 2 }, { min: 3, max: 5 }, { min: 6, max: 10 },
        { min: 11, max: 15 }, { min: 16, max: 20 }, { min: 21, max: 25 },
        { min: 26, max: 30 },
      ],
      prices: {},
    },
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = form;

  const { fields: distanceFields, append: appendDistance, remove: removeDistance } = useFieldArray({ control, name: "distanceRanges" });
  const { fields: tonnageFields, append: appendTonnage, remove: removeTonnage } = useFieldArray({ control, name: "tonnageRanges" });

  const distanceRanges = watch("distanceRanges");
  const tonnageRanges = watch("tonnageRanges");
  const prices = watch("prices") || {};

  // Auto-initialize prices
  useEffect(() => {
    const newPrices: any = { ...prices };
    let changed = false;

    distanceRanges.forEach((dist) => {
      const dKey = `${dist.min}-${dist.max}`;
      if (!newPrices[dKey]) newPrices[dKey] = {};
      tonnageRanges.forEach((ton) => {
        const tKey = `${ton.min}-${ton.max}`;
        if (newPrices[dKey][tKey] === undefined) {
          newPrices[dKey][tKey] = 0;
          changed = true;
        }
      });
    });

    if (changed) setValue("prices", newPrices);
  }, [distanceRanges, tonnageRanges, setValue]);

  // Distance Ranges Table
  const distanceColumns: ColumnDef<any>[] = [
    { id: 'min', header: 'Min (KM)', cell: ({ row }) => (
      <Controller
        control={control}
        name={`distanceRanges.${row.index}.min`}
        render={({ field }) => <input type="number" {...field} className="w-full p-2 border rounded" />}
      />
    )},
    { id: 'max', header: 'Max (KM)', cell: ({ row }) => (
      <Controller
        control={control}
        name={`distanceRanges.${row.index}.max`}
        render={({ field }) => <input type="number" {...field} className="w-full p-2 border rounded" />}
      />
    )},
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button onClick={() => removeDistance(row.index)} className="text-red-600 hover:text-red-800">
          <Trash2 size={18} />
        </button>
      )
    },
  ];

  // Tonnage Ranges Table
  const tonnageColumns: ColumnDef<any>[] = [
    { id: 'min', header: 'Min (MT)', cell: ({ row }) => (
      <Controller
        control={control}
        name={`tonnageRanges.${row.index}.min`}
        render={({ field }) => <input type="number" {...field} className="w-full p-2 border rounded" />}
      />
    )},
    { id: 'max', header: 'Max (MT)', cell: ({ row }) => (
      <Controller
        control={control}
        name={`tonnageRanges.${row.index}.max`}
        render={({ field }) => <input type="number" max={30} {...field} className="w-full p-2 border rounded" />}
      />
    )},
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button onClick={() => removeTonnage(row.index)} className="text-red-600 hover:text-red-800">
          <Trash2 size={18} />
        </button>
      )
    },
  ];

  // Main Price Matrix
  const priceColumns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = [
      {
        id: 'distance',
        header: 'Distance (KM)',
        cell: ({ row }) => {
          const d = distanceRanges[row.index];
          return `${d.min} - ${d.max === 9999 ? '∞' : d.max}`;
        },
      },
    ];

    tonnageRanges.forEach((ton) => {
      const tKey = `${ton.min}-${ton.max}`;
      cols.push({
        id: tKey,
        header: `${ton.min}-${ton.max} MT`,
        cell: ({ row }) => {
          const dist = distanceRanges[row.index];
          const dKey = `${dist.min}-${dist.max}`;
          return (
            <input
              type="number"
              value={prices[dKey]?.[tKey] ?? 0}
              onChange={(e) => {
                const newPrices = { ...prices };
                if (!newPrices[dKey]) newPrices[dKey] = {};
                newPrices[dKey][tKey] = parseFloat(e.target.value) || 0;
                setValue('prices', newPrices);
              }}
              className="w-full p-2 text-right border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          );
        },
      });
    });

    return cols;
  }, [distanceRanges, tonnageRanges, prices, setValue]);

  const tableData = distanceRanges.map((_, i) => ({ index: i }));

  const distanceTable = useReactTable({ data: distanceFields, columns: distanceColumns, getCoreRowModel: getCoreRowModel() });
  const tonnageTable = useReactTable({ data: tonnageFields, columns: tonnageColumns, getCoreRowModel: getCoreRowModel() });
  const priceTable = useReactTable({ data: tableData, columns: priceColumns, getCoreRowModel: getCoreRowModel() });

  const onSubmit = (data: FormData) => {
    console.log("Price Schedule Saved:", data);
    alert("✅ Price schedule saved successfully!");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold mb-8">Price Schedule Manager</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* Distance Ranges Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Distance Ranges (KM)</h2>
            <button
              type="button"
              onClick={() => appendDistance({ min: 0, max: 100 })}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus size={18} /> Add Row
            </button>
          </div>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                {distanceTable.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(header => (
                      <th key={header.id} className="px-4 py-3 text-left font-semibold">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {distanceTable.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tonnage Ranges Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tonnage Ranges (MT) — Max 30</h2>
            <button
              type="button"
              onClick={() => appendTonnage({ min: 0, max: 5 })}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus size={18} /> Add Row
            </button>
          </div>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                {tonnageTable.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(header => (
                      <th key={header.id} className="px-4 py-3 text-left font-semibold">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {tonnageTable.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price Matrix */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Price Matrix (UGX per combination)</h2>
          <div className="border rounded-xl overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-100 sticky top-0">
                {priceTable.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(header => (
                      <th key={header.id} className="px-4 py-3 text-left font-semibold border-r last:border-r-0">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {priceTable.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 border-r last:border-r-0">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {errors.distanceRanges && <p className="text-red-600">{errors.distanceRanges.message}</p>}
        {errors.tonnageRanges && <p className="text-red-600">{errors.tonnageRanges.message}</p>}

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-10 py-4 rounded-2xl text-lg"
          >
            <Save size={22} />
            Save Complete Price Schedule
          </button>
        </div>
      </form>
    </div>
  );
}