import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

import { formatRange } from './sample-data'
import { type Shipment } from "@/features/shipments/types"

const longDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

/** The whole detail surface of the free block: the selected day, listed. No sheet, no actions. */
export function CalendarDayPanel({ date, events }: { date: Date; events: Shipment[] }) {
  return (
    <section aria-label={`Events on ${longDate.format(date)}`} className="flex flex-col gap-2.5">
      <h3 className="flex items-baseline gap-2 text-sm font-semibold">
        {longDate.format(date)}
        <span className="text-muted-foreground ml-auto text-xs font-normal tabular-nums">
          {events.length === 0 ? '' : `${events.length} event${events.length === 1 ? '' : 's'}`}
        </span>
      </h3>

      {events.length === 0 ? (
        <Empty className="border border-dashed py-8">
          <EmptyHeader>
            <EmptyTitle>Nothing scheduled</EmptyTitle>
            <EmptyDescription>Pick another day to see what is on.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        events.map(event => (
          <Item key={event.id} variant={"muted"} size="sm" className='border-border'>
            {/*
              `ItemMedia` self-starts and nudges down half a step once a description is present —
              tuned for a 40px avatar, which left this 8px dot pinned to the top of the row. A box
              the height of the title's line puts the dot on the title instead.
            */}
            <ItemMedia className="h-5 translate-y-0 items-center self-start">
              <span aria-hidden="true" className="bg-foreground size-2 rounded-full" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {event.number ?? event.item.display_name}
              </ItemTitle>
              <ItemDescription className="tabular-nums">{formatRange(event)}</ItemDescription>
            </ItemContent>
          </Item>
        ))
      )}
    </section>
  )
}
