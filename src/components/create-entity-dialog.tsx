"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useHotkey } from "@tanstack/react-hotkeys"
import { Route as BookingCreate } from "@/app/_admin/bookings/new"
import { Route as ClientCreate } from "@/app/_admin/clients/new"
import { Route as DriverCreate } from "@/app/_admin/drivers/new"
import { Route as ServiceCreate } from "@/app/_admin/services/new"
import { Route as VehicleCreate } from "@/app/_admin/vehicles/new"
import { Route as RideCreate } from "@/app/_admin/rides/new"
import { Can } from "./has-permission"
import { useNavigate } from "@tanstack/react-router"

const entityList = [
  {
    to: BookingCreate.to,
    label: "booking",
    command: "⌘B",
    permission: "bookings:create",
  },
  {
    to: ClientCreate.to,
    label: "client",
    command: "⌘C",
    permission: "clients:create",
  },
  {
    to: DriverCreate.to,
    label: "driver",
    command: "⌘D",
    permission: "drivers:create",
  },
  {
    to: RideCreate.to,
    label: "ride",
    command: "⌘R",
    permission: "rides:create",
  },
  {
    to: ServiceCreate.to,
    label: "service",
    command: "⌘S",
    permission: "services:create",
  },
  {
    to: VehicleCreate.to,
    label: "vehicle",
    command: "⌘V",
    permission: "vehicles:create",
  },
] as const

export function CreateEntityDialog() {
  const [open, setOpen] = React.useState(false)

  const navigate = useNavigate()

  // 1. Listen for ⌘N or Ctrl+N to toggle the menu
  useHotkey({ mod: true, key: "n" }, () => {
    setOpen((prev) => !prev)
  })

  return (
    <div>
      <Button onClick={() => setOpen(true)} variant="outline" size={"icon-xs"}>
        <PlusIcon />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search create entity ..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {entityList.map((entity) => (
                <Can permission={entity.permission} key={entity.to}>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      navigate({ to: entity.to })
                    }}
                  >
                    <PlusIcon />
                    <span>{entity.label}</span>
                    <CommandShortcut>{entity.command}</CommandShortcut>
                  </CommandItem>
                </Can>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem>
                <PlusIcon />
                <span>New File</span>
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  )
}
