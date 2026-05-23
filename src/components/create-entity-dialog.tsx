import { useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { 
  User, 
  Settings, 
  CreditCard, 
  Plus} from "lucide-react"

export function CreateEntityDialog() {
  const [open, setOpen] = useState(false)

  // 1. Listen for ⌘N or Ctrl+N to toggle the menu
  useHotkeys("mod+n", (event) => {
    event.preventDefault()
    setOpen((prev) => !prev)
  })

  // 2. Action handler for when an item is selected
  const runCommand = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <>
      {/* Visual cue for users who prefer clicking */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded border bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Plus className="h-4 w-4" />
        <span>Search actions...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span>⌘</span>N
        </kbd>
      </button>

      {/* The Command Dialog Wrapper */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand(() => console.log("New Project"))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New Project</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => console.log("Profile"))}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => console.log("Billing"))}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing & Subscription</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => console.log("General Settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>General Settings</span>
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}