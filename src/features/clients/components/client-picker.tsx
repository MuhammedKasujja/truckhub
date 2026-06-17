import { AutoComplete } from "@/components/ui/autocomplete"
import { Client } from "../types"

type ClientPickerProps = {
  onSelect: (client: Client | null) => void
  clients: Client[]
}

export function ClientPicker({ onSelect, clients }: ClientPickerProps) {
  return (
    <AutoComplete<Client>
      triggerClassName="flex-1 w-full"
      fetcher={async (_) => {
        return clients
      }}
      renderOption={(client) => (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="font-medium">{client.name}</div>
          </div>
        </div>
      )}
      getOptionValue={(client) => client.id.toString()}
      getDisplayValue={(client) => (
        <div className="flex items-center gap-2 text-left">
          <div className="flex flex-col leading-tight">
            <div className="font-medium">{client.name}</div>
          </div>
        </div>
      )}
      notFound={
        <div className="py-6 text-center text-sm">No Clients found</div>
      }
      label="Client"
      placeholder="Search client..."
      value={undefined}
      onChange={(client) => {
        if (client)
          onSelect({
            ...client,
            contacts: [
              {
                name: "Kasujja Musa",
                id: "739403043",
                phone: "078493843",
                email: "musa@mail.com",
                is_primary: true
              },
              {
                name: "Isaac Otim",
                id: "98738943",
                phone: "0794893400",
                email: "otim@mail.com",
              },
            ],
          })
        else onSelect(null)
      }}
    />
  )
}
