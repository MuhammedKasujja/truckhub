import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item"
import { ServiceForm } from "@/features/services/components"
import { EntityId } from "@/schemas"

type ServiceSelectDialogProps = {
  clientId: EntityId
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function ClientServicesDialog({
  clientId,
  open,
  onOpenChange,
}: ServiceSelectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-h-[90vh] overflow-hidden p-0 md:min-w-[90vw]">
        <div className="flex w-full flex-col">
          <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Client Service Pricing
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Services</span>
              <div className="flex gap-4"></div>
            </DialogDescription>
          </DialogHeader>
          <div className="grid flex-1 grid-cols-6 overflow-hidden">
            <div className="col-span-4 flex-1 space-y-4 overflow-y-auto border-r p-6">
              <div className="flex w-full max-w-xl flex-col gap-6">
                <ItemGroup className="grid grid-cols-3 gap-4">
                  {models.map((model) => (
                    <Item key={model.name} variant="outline">
                      <ItemHeader className="w-32 h-32 aspect-square rounded-sm object-cover">
                        {/* <Image
                src={model.image}
                alt={model.name}
                width={128}
                height={128}
                className="aspect-square w-full rounded-sm object-cover"
              /> */}
                      </ItemHeader>
                      <ItemContent>
                        <ItemTitle>{model.name}</ItemTitle>
                        <ItemDescription>{model.description}</ItemDescription>
                      </ItemContent>
                    </Item>
                  ))}
                </ItemGroup>
              </div>
            </div>
            <div className="col-span-2 overflow-y-auto p-6">
              <ServiceForm mode="create" onSubmit={(data) => {}} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const models = [
  {
    name: "v0-1.5-sm",
    description: "Everyday tasks and UI generation.",
    image:
      "https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop",
    credit: "Valeria Reverdo on Unsplash",
  },
  {
    name: "v0-1.5-lg",
    description: "Advanced thinking or reasoning.",
    image:
      "https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop",
    credit: "Michael Oeser on Unsplash",
  },
  {
    name: "v0-2.0-mini",
    description: "Open Source model for everyone.",
    image:
      "https://images.unsplash.com/photo-1602146057681-08560aee8cde?q=80&w=640&auto=format&fit=crop",
    credit: "Cherry Laithang on Unsplash",
  },
]
