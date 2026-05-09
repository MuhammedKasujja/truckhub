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
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { MapLocation } from "@/types/map";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

export function SearchForm({ ...props }: React.ComponentProps<"div">) {
  const tr = useTranslation();
  const [locations, setLocations] = useState<MapLocation[]>([]);

  async function handleSearchLocation(query: string) {
    const data = await searchPlaces(query);
    if (data) setLocations(data);
  }

  return (
    <Dialog>
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
              <Kbd>⌘K</Kbd>
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
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
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
