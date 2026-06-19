import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { ClientContact } from "../types"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from "react"
import { EntityId } from "@/schemas"
// import { PlusIcon } from "lucide-react"

type ClientContactsListProps = {
  contacts: ClientContact[]
  onSelected?: (contactsIds: EntityId[]) => void
}

export function ClientContactsList({
  contacts,
  onSelected,
}: ClientContactsListProps) {
  const [selected, setSelected] = useState<Set<EntityId>>(new Set())

  useEffect(() => {
    const defaultSelected = new Set([
      ...contacts.filter((ele) => ele.is_primary).map((ele) => ele.id),
    ])
    setSelected(defaultSelected)
    onSelected?.([...defaultSelected])
  }, [contacts])

  function handleContactSelect(contactId: EntityId, checked: boolean) {
    const newSelected = new Set(selected)
    if (checked) {
      newSelected.add(contactId)
    } else {
      newSelected.delete(contactId)
    }
    setSelected(newSelected)
    onSelected?.([...newSelected])
  }
  return (
    <>
      {contacts.map((contact) => (
        <Item key={contact.id}>
          <ItemContent>
            <ItemTitle>{contact.name}</ItemTitle>
            <ItemDescription>
              <div>{contact.phone}</div>
              {contact.email && <div>{contact.email}</div>}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            {onSelected && (
                <Checkbox
                  checked={selected.has(contact.id)}
                  onCheckedChange={(checked) => {
                    handleContactSelect(contact.id, checked as boolean)
                  }}
                />
            )}
          </ItemActions>
        </Item>
      ))}
      {/* <Button type="button" variant={"outline"} className="w-32">
        <PlusIcon/>
      </Button> */}
    </>
  )
}
