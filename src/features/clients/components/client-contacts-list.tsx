import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { ClientContact } from "../types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from "react"
import { EntityId } from "@/schemas"
import { useTranslation } from "@/i18n"
// import { PlusIcon } from "lucide-react"

// Stable reference, so the effect below doesn't rerun on every render
const NO_CONTACTS: ClientContact[] = []

type ClientContactsListProps = {
  contacts?: ClientContact[]
  /** Makes the selection controlled, and stops primaries being auto-selected */
  selectedIds?: EntityId[]
  onSelected?: (contactsIds: EntityId[]) => void
}

export function ClientContactsList({
  contacts = NO_CONTACTS,
  selectedIds,
  onSelected,
}: ClientContactsListProps) {
  const tr = useTranslation()
  const [internalSelected, setInternalSelected] = useState<Set<EntityId>>(
    new Set()
  )
  const isControlled = selectedIds !== undefined
  const selected = isControlled ? new Set(selectedIds) : internalSelected

  useEffect(() => {
    if (isControlled) return
    const defaultSelected = new Set([
      ...contacts.filter((ele) => ele.is_primary).map((ele) => ele.id),
    ])
    setInternalSelected(defaultSelected)
    onSelected?.([...defaultSelected])
  }, [contacts, isControlled])

  function handleContactSelect(contactId: EntityId, checked: boolean) {
    const newSelected = new Set(selected)
    if (checked) {
      newSelected.add(contactId)
    } else {
      newSelected.delete(contactId)
    }
    if (!isControlled) setInternalSelected(newSelected)
    onSelected?.([...newSelected])
  }
  return (
    <>
      {contacts.map((contact) => (
        <Item key={contact.id}>
          <ItemContent>
            <ItemTitle>
              {contact.name}
              {contact.is_primary && (
                <Badge variant="secondary">{tr("clients.primary")}</Badge>
              )}
            </ItemTitle>
            <ItemDescription>
              <span className="block">{contact.phone}</span>
              {contact.email && (
                <span className="block">{contact.email}</span>
              )}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            {onSelected && (
              <Checkbox
                checked={selected.has(contact.id)}
                onCheckedChange={(checked: boolean) => {
                  handleContactSelect(contact.id, checked)
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
