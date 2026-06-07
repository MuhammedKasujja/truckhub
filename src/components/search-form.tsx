"use client";

import { useTranslation } from "@/i18n";
import { SearchIcon } from "lucide-react";
import { Kbd } from "./ui/kbd";
import { searchPlaces } from "@/server/maps";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { MapLocation } from "@/types/map";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { formatForDisplay, useHotkey } from '@tanstack/react-hotkeys'

export function SearchForm({ ...props }: React.ComponentProps<"div">) {
  const tr = useTranslation();
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false)

  // mod automatically maps Command on Mac and Control on Windows/Linux
  useHotkey({ mod: true, key: "k" }, () => {
    setIsOpen((prev) => !prev)
  })

  async function handleSearchLocation(query: string) {
    const data = await searchPlaces(query);
    if (data) setLocations(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DialogTrigger asChild>
          <div {...props} className="flex w-full max-w-xs flex-col gap-6">
            <Button
              type="button"
              variant={"outline"}
              className="w-full md:w-52 justify-between text-left font-normal text-muted-foreground"
            >
              <SearchIcon />
              {tr("search")}...
              <Kbd>{formatForDisplay('Mod+K')}</Kbd>
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm ring-4">
          <DialogHeader>
            <DialogTitle>Search Truckhub</DialogTitle>
            <DialogDescription>
              Filter and search the entire system in one go
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Input
                id="name-1"
                name="name"
                defaultValue=""
                onChange={(e) => handleSearchLocation(e.target.value)}
              />
            </Field>
          </FieldGroup>
          {locations &&
            locations.map((loc) => (
              <Item size={"xs"}>
                <ItemContent>
                  <ItemTitle>{loc.name}</ItemTitle>
                  <ItemDescription>
                    {loc.lat} - {loc.long}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          <DialogFooter className="py-1.5 flex justify-start">
            <DialogClose asChild>
              <Button variant="outline" size={'xs'}>Esc</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
