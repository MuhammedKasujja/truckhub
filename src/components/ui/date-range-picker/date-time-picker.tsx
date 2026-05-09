"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

import { cn, now } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateTime } from "luxon";


export interface DateTimePickerProps {
  onSelect: (date: Date | undefined) => void;
  startDate?: Date;
  selected?: Date;
  endDate?: Date | undefined;
  placeholder?: string
}

export function DateTimePickerModified({ onSelect, selected, placeholder }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState<string>(now().toFormat("HH:mm"));
  const [date, setDate] = useState<Date | undefined>(selected);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full font-normal", !date && "text-muted-foreground")}
        >
          {date ? `${format(date, "PPP")}, ${time}` : <span>{placeholder}</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex items-start flex-row" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                const [hours, minutes] = time.split(":");
                selectedDate.setHours(parseInt(hours), parseInt(minutes));
                setDate(selectedDate);
                onSelect(selectedDate);
              }
            }}
            onDayClick={() => setIsOpen(false)}
            fromYear={2000}
            toYear={new Date().getFullYear()}
            disabled={(date) =>
              Number(date) < Date.now() - 1000 * 60 * 60 * 24 ||
              Number(date) > Date.now() + 1000 * 60 * 60 * 24 * 30
            }
          />
        <div className="w-30 my-4 mr-2">
          <ScrollArea className="h-72">
            <div className="flex flex-col gap-2 h-full">
              {Array.from({ length: 96 }).map((_, i) => {
                const hour = Math.floor(i / 4)
                  .toString()
                  .padStart(2, "0");
                const minute = ((i % 4) * 15).toString().padStart(2, "0");
                const timeValue = `${hour}:${minute}`;
                return (
                  <Button
                    key={i}
                    className="w-full text-left px-2"
                    variant="outline"
                    onClick={() => {
                      setTime(timeValue);
                      if (date) {
                        const newDate = new Date(date.getTime());
                        newDate.setHours(parseInt(hour), parseInt(minute));
                        setDate(newDate);
                        onSelect(newDate);
                      }
                      setIsOpen(false);
                    }}
                  >
                    {timeValue}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
