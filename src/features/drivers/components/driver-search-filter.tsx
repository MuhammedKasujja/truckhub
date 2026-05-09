"use client";

import { AutoComplete } from "@/components/ui/autocomplete";
import { Driver } from "../types";
import { getDriversByQuery } from "../service";
import { useState } from "react";

interface DriverSearchFilterProps {
  onSelected: (driver?: Driver | null) => void;
  className?: string 
};

export function DriverSearchFilter({ onSelected, className }: DriverSearchFilterProps) {
  const [driverId, setDriverId] = useState<string>("");
  return (
    <AutoComplete<Driver>
      triggerClassName={className}
      fetcher={async (search) => {
        if (!search || search.length < 3) return [];
        const { data } = await getDriversByQuery({ search });
        return data ?? [];
      }}
      renderOption={(driver) => (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="font-medium">{driver.fullname}</div>
          </div>
        </div>
      )}
      getOptionValue={(location) => location.id.toString()}
      getDisplayValue={(location) => (
        <div className="flex items-center gap-2 text-left">
          <div className="flex flex-col leading-tight">
            <div className="font-medium">{location.fullname}</div>
          </div>
        </div>
      )}
      notFound={
        <div className="py-6 text-center text-sm">No Drivers found</div>
      }
      label="Location"
      placeholder="Search driver..."
      value={driverId}
      onChange={async (driver) => {
        setDriverId(driver?.id.toString() ?? "");
        onSelected(driver);
      }}
    />
  );
}
