import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline"
import { RideStatus, RideStatusList } from "@/features/ride-requests/types"
import { useTranslation } from "@/i18n"
import { CircleDotIcon } from "lucide-react"

type RideTimelineProps = {
  status: RideStatus | undefined
}

export function RideTimeline({ status }: RideTimelineProps) {
  const tr = useTranslation()
  return (
    <Timeline
      activeIndex={status ? RideStatusList.indexOf(status) : 0}
      className="[--timeline-dot-size:2rem]"
    >
      {RideStatusList.map((item) => (
        <TimelineItem key={item}>
          <TimelineDot>
            <CircleDotIcon className="size-3.5" />
          </TimelineDot>
          <TimelineConnector />
          <TimelineContent>
            <TimelineHeader>
              {/* <TimelineTime dateTime={item.dateTime}>{item.date}</TimelineTime> */}
              <TimelineTitle>{tr(`rides.statues.${item}`)}</TimelineTitle>
            </TimelineHeader>
            {/* <TimelineDescription>{item.description}</TimelineDescription> */}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}
