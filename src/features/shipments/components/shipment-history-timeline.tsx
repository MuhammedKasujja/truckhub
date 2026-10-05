import {
  Timeline,
  TimelineConnector,
  TimelineContent,
//   TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline"
import { ShipmentHistory } from "../types"
import { CircleDotIcon } from "lucide-react"
import { formatDate } from "@/lib/format"
import { useTranslation } from "@/i18n"

type Props = {
  history: ShipmentHistory[]
}

export function ShipmentHistoryTimeline({ history }: Props) {
  const tr = useTranslation()
  return (
    <Timeline
      activeIndex={history.length - 1}
      className="[--timeline-dot-size:2rem]"
    >
      {history.map((item) => (
        <TimelineItem key={item.created_at.toString()}>
          <TimelineDot>
            <CircleDotIcon className="size-3.5" />
          </TimelineDot>
          <TimelineConnector />
          <TimelineContent>
            <TimelineHeader>
              <TimelineTitle>{tr(`shipments.status.${item.status}`)}</TimelineTitle>
              <TimelineTime dateTime={item.created_at.toString()}>
                {formatDate(item.created_at)}
              </TimelineTime>
            </TimelineHeader>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}
