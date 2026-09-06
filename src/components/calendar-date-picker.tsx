// "use client"

// import * as React from "react"
// import { CalendarIcon } from "lucide-react"
// import {
//   startOfWeek,
//   endOfWeek,
//   subDays,
//   startOfMonth,
//   endOfMonth,
//   startOfYear,
//   endOfYear,
//   startOfDay,
//   endOfDay,
// } from "date-fns"
// import { toDate, formatInTimeZone } from "date-fns-tz"
// import { DateRange } from "react-day-picker"
// import { cva, VariantProps } from "class-variance-authority"

// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Calendar } from "./ui/calendar"

// const months = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ]

// const multiSelectVariants = cva(
//   "flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap text-foreground ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
//   {
//     variants: {
//       variant: {
//         default: "bg-primary text-primary-foreground hover:bg-primary/90",
//         destructive:
//           "text-destructive-foreground bg-destructive hover:bg-destructive/90",
//         outline:
//           "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
//         secondary:
//           "bg-secondary text-secondary-foreground hover:bg-secondary/80",
//         ghost: "text-background hover:bg-accent hover:text-accent-foreground",
//         link: "text-background underline-offset-4 hover:underline",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//     },
//   }
// )

// interface CalendarDatePickerProps
//   extends
//     React.HTMLAttributes<HTMLButtonElement>,
//     VariantProps<typeof multiSelectVariants> {
//   id?: string
//   className?: string
//   date: DateRange
//   closeOnSelect?: boolean
//   numberOfMonths?: 1 | 2
//   yearsRange?: number
//   onDateSelect: (range: { from: Date; to: Date }) => void
// }

// export const CalendarDatePicker = React.forwardRef<
//   HTMLButtonElement,
//   CalendarDatePickerProps
// >(
//   (
//     {
//       id = "calendar-date-picker",
//       className,
//       date,
//       closeOnSelect = false,
//       numberOfMonths = 2,
//       yearsRange = 10,
//       onDateSelect,
//       variant,
//       ...props
//     },
//     ref
//   ) => {
//     const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
//     const [selectedRange, setSelectedRange] = React.useState<string | null>(
//       numberOfMonths === 2 ? "This Year" : "Today"
//     )
//     const [monthFrom, setMonthFrom] = React.useState<Date | undefined>(
//       date?.from
//     )
//     const [yearFrom, setYearFrom] = React.useState<number | undefined>(
//       date?.from?.getFullYear()
//     )
//     const [monthTo, setMonthTo] = React.useState<Date | undefined>(
//       numberOfMonths === 2 ? date?.to : date?.from
//     )
//     const [yearTo, setYearTo] = React.useState<number | undefined>(
//       numberOfMonths === 2 ? date?.to?.getFullYear() : date?.from?.getFullYear()
//     )
//     const [highlightedPart, setHighlightedPart] = React.useState<string | null>(
//       null
//     )

//     const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

//     const handleClose = () => setIsPopoverOpen(false)

//     const handleTogglePopover = () => setIsPopoverOpen((prev) => !prev)

//     const selectDateRange = (from: Date, to: Date, range: string) => {
//       const startDate = startOfDay(toDate(from, { timeZone }))
//       const endDate =
//         numberOfMonths === 2 ? endOfDay(toDate(to, { timeZone })) : startDate
//       onDateSelect({ from: startDate, to: endDate })
//       setSelectedRange(range)
//       setMonthFrom(from)
//       setYearFrom(from.getFullYear())
//       setMonthTo(to)
//       setYearTo(to.getFullYear())
//       closeOnSelect && setIsPopoverOpen(false)
//     }

//     const handleDateSelect = (range: DateRange | undefined) => {
//       if (range) {
//         let from = startOfDay(toDate(range.from as Date, { timeZone }))
//         let to = range.to ? endOfDay(toDate(range.to, { timeZone })) : from
//         if (numberOfMonths === 1) {
//           if (range.from !== date.from) {
//             to = from
//           } else {
//             from = startOfDay(toDate(range.to as Date, { timeZone }))
//           }
//         }
//         onDateSelect({ from, to })
//         setMonthFrom(from)
//         setYearFrom(from.getFullYear())
//         setMonthTo(to)
//         setYearTo(to.getFullYear())
//       }
//       setSelectedRange(null)
//     }

//     const handleMonthChange = (newMonthIndex: number, part: string) => {
//       setSelectedRange(null)
//       if (part === "from") {
//         if (yearFrom !== undefined) {
//           if (newMonthIndex < 0 || newMonthIndex > yearsRange + 1) return
//           const newMonth = new Date(yearFrom, newMonthIndex, 1)
//           const from =
//             numberOfMonths === 2
//               ? startOfMonth(toDate(newMonth, { timeZone }))
//               : date?.from
//                 ? new Date(
//                     date.from.getFullYear(),
//                     newMonth.getMonth(),
//                     date.from.getDate()
//                   )
//                 : newMonth
//           const to =
//             numberOfMonths === 2
//               ? date.to
//                 ? endOfDay(toDate(date.to, { timeZone }))
//                 : endOfMonth(toDate(newMonth, { timeZone }))
//               : from
//           if (from <= to) {
//             onDateSelect({ from, to })
//             setMonthFrom(newMonth)
//             setMonthTo(date.to)
//           }
//         }
//       } else {
//         if (yearTo !== undefined) {
//           if (newMonthIndex < 0 || newMonthIndex > yearsRange + 1) return
//           const newMonth = new Date(yearTo, newMonthIndex, 1)
//           const from = date.from
//             ? startOfDay(toDate(date.from, { timeZone }))
//             : startOfMonth(toDate(newMonth, { timeZone }))
//           const to =
//             numberOfMonths === 2
//               ? endOfMonth(toDate(newMonth, { timeZone }))
//               : from
//           if (from <= to) {
//             onDateSelect({ from, to })
//             setMonthTo(newMonth)
//             setMonthFrom(date.from)
//           }
//         }
//       }
//     }

//     const handleYearChange = (newYear: number, part: string) => {
//       setSelectedRange(null)
//       if (part === "from") {
//         if (years.includes(newYear)) {
//           const newMonth = monthFrom
//             ? new Date(newYear, monthFrom ? monthFrom.getMonth() : 0, 1)
//             : new Date(newYear, 0, 1)
//           const from =
//             numberOfMonths === 2
//               ? startOfMonth(toDate(newMonth, { timeZone }))
//               : date.from
//                 ? new Date(newYear, newMonth.getMonth(), date.from.getDate())
//                 : newMonth
//           const to =
//             numberOfMonths === 2
//               ? date.to
//                 ? endOfDay(toDate(date.to, { timeZone }))
//                 : endOfMonth(toDate(newMonth, { timeZone }))
//               : from
//           if (from <= to) {
//             onDateSelect({ from, to })
//             setYearFrom(newYear)
//             setMonthFrom(newMonth)
//             setYearTo(date.to?.getFullYear())
//             setMonthTo(date.to)
//           }
//         }
//       } else {
//         if (years.includes(newYear)) {
//           const newMonth = monthTo
//             ? new Date(newYear, monthTo.getMonth(), 1)
//             : new Date(newYear, 0, 1)
//           const from = date.from
//             ? startOfDay(toDate(date.from, { timeZone }))
//             : startOfMonth(toDate(newMonth, { timeZone }))
//           const to =
//             numberOfMonths === 2
//               ? endOfMonth(toDate(newMonth, { timeZone }))
//               : from
//           if (from <= to) {
//             onDateSelect({ from, to })
//             setYearTo(newYear)
//             setMonthTo(newMonth)
//             setYearFrom(date.from?.getFullYear())
//             setMonthFrom(date.from)
//           }
//         }
//       }
//     }

//     const today = new Date()

//     const years = Array.from(
//       { length: yearsRange + 1 },
//       (_, i) => today.getFullYear() - yearsRange / 2 + i
//     )

//     const dateRanges = [
//       { label: "Today", start: today, end: today },
//       { label: "Yesterday", start: subDays(today, 1), end: subDays(today, 1) },
//       {
//         label: "This Week",
//         start: startOfWeek(today, { weekStartsOn: 1 }),
//         end: endOfWeek(today, { weekStartsOn: 1 }),
//       },
//       {
//         label: "Last Week",
//         start: subDays(startOfWeek(today, { weekStartsOn: 1 }), 7),
//         end: subDays(endOfWeek(today, { weekStartsOn: 1 }), 7),
//       },
//       { label: "Last 7 Days", start: subDays(today, 6), end: today },
//       {
//         label: "This Month",
//         start: startOfMonth(today),
//         end: endOfMonth(today),
//       },
//       {
//         label: "Last Month",
//         start: startOfMonth(subDays(today, today.getDate())),
//         end: endOfMonth(subDays(today, today.getDate())),
//       },
//       { label: "This Year", start: startOfYear(today), end: endOfYear(today) },
//       {
//         label: "Last Year",
//         start: startOfYear(subDays(today, 365)),
//         end: endOfYear(subDays(today, 365)),
//       },
//     ]

//     const handleMouseOver = (part: string) => {
//       setHighlightedPart(part)
//     }

//     const handleMouseLeave = () => {
//       setHighlightedPart(null)
//     }

//     const handleWheel = (event: React.WheelEvent, part: string) => {
//       event.preventDefault()
//       setSelectedRange(null)
//       if (highlightedPart === "firstDay") {
//         const newDate = new Date(date.from as Date)
//         const increment = event.deltaY > 0 ? -1 : 1
//         newDate.setDate(newDate.getDate() + increment)
//         if (newDate <= (date.to as Date)) {
//           numberOfMonths === 2
//             ? onDateSelect({ from: newDate, to: new Date(date.to as Date) })
//             : onDateSelect({ from: newDate, to: newDate })
//           setMonthFrom(newDate)
//         } else if (newDate > (date.to as Date) && numberOfMonths === 1) {
//           onDateSelect({ from: newDate, to: newDate })
//           setMonthFrom(newDate)
//         }
//       } else if (highlightedPart === "firstMonth") {
//         const currentMonth = monthFrom ? monthFrom.getMonth() : 0
//         const newMonthIndex = currentMonth + (event.deltaY > 0 ? -1 : 1)
//         handleMonthChange(newMonthIndex, "from")
//       } else if (highlightedPart === "firstYear" && yearFrom !== undefined) {
//         const newYear = yearFrom + (event.deltaY > 0 ? -1 : 1)
//         handleYearChange(newYear, "from")
//       } else if (highlightedPart === "secondDay") {
//         const newDate = new Date(date.to as Date)
//         const increment = event.deltaY > 0 ? -1 : 1
//         newDate.setDate(newDate.getDate() + increment)
//         if (newDate >= (date.from as Date)) {
//           onDateSelect({ from: new Date(date.from as Date), to: newDate })
//           setMonthTo(newDate)
//         }
//       } else if (highlightedPart === "secondMonth") {
//         const currentMonth = monthTo ? monthTo.getMonth() : 0
//         const newMonthIndex = currentMonth + (event.deltaY > 0 ? -1 : 1)
//         handleMonthChange(newMonthIndex, "to")
//       } else if (highlightedPart === "secondYear" && yearTo !== undefined) {
//         const newYear = yearTo + (event.deltaY > 0 ? -1 : 1)
//         handleYearChange(newYear, "to")
//       }
//     }

//     React.useEffect(() => {
//       const firstDayElement = document.getElementById(`firstDay-${id}`)
//       const firstMonthElement = document.getElementById(`firstMonth-${id}`)
//       const firstYearElement = document.getElementById(`firstYear-${id}`)
//       const secondDayElement = document.getElementById(`secondDay-${id}`)
//       const secondMonthElement = document.getElementById(`secondMonth-${id}`)
//       const secondYearElement = document.getElementById(`secondYear-${id}`)

//       const elements = [
//         firstDayElement,
//         firstMonthElement,
//         firstYearElement,
//         secondDayElement,
//         secondMonthElement,
//         secondYearElement,
//       ]

//       const addPassiveEventListener = (element: HTMLElement | null) => {
//         if (element) {
//           element.addEventListener(
//             "wheel",
//             handleWheel as unknown as EventListener,
//             {
//               passive: false,
//             }
//           )
//         }
//       }

//       elements.forEach(addPassiveEventListener)

//       return () => {
//         elements.forEach((element) => {
//           if (element) {
//             element.removeEventListener(
//               "wheel",
//               handleWheel as unknown as EventListener
//             )
//           }
//         })
//       }
//     }, [highlightedPart, date])

//     const formatWithTz = (date: Date, fmt: string) =>
//       formatInTimeZone(date, timeZone, fmt)

//     return (
//       <>
//         <style>
//           {`
//             .date-part {
//               touch-action: none;
//             }
//           `}
//         </style>
//         <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
//           <PopoverTrigger asChild>
//             <Button
//               id="date"
//               ref={ref}
//               {...props}
//               className={cn(
//                 "w-auto",
//                 multiSelectVariants({ variant, className })
//               )}
//               size="default"
//               onClick={handleTogglePopover}
//               suppressHydrationWarning
//             >
//               <CalendarIcon className="mr-2 h-4 w-4" />
//               <span>
//                 {date?.from ? (
//                   date.to ? (
//                     <>
//                       <span
//                         id={`firstDay-${id}`}
//                         className={cn(
//                           "date-part",
//                           highlightedPart === "firstDay" &&
//                             "font-bold underline"
//                         )}
//                         onMouseOver={() => handleMouseOver("firstDay")}
//                         onMouseLeave={handleMouseLeave}
//                       >
//                         {formatWithTz(date.from, "dd")}
//                       </span>{" "}
//                       <span
//                         id={`firstMonth-${id}`}
//                         className={cn(
//                           "date-part",
//                           highlightedPart === "firstMonth" &&
//                             "font-bold underline"
//                         )}
//                         onMouseOver={() => handleMouseOver("firstMonth")}
//                         onMouseLeave={handleMouseLeave}
//                       >
//                         {formatWithTz(date.from, "LLL")}
//                       </span>
//                       ,{" "}
//                       <span
//                         id={`firstYear-${id}`}
//                         className={cn(
//                           "date-part",
//                           highlightedPart === "firstYear" &&
//                             "font-bold underline"
//                         )}
//                         onMouseOver={() => handleMouseOver("firstYear")}
//                         onMouseLeave={handleMouseLeave}
//                       >
//                         {formatWithTz(date.from, "y")}
//                       </span>
//                       {numberOfMonths === 2 && (
//                         <>
//                           {" - "}
//                           <span
//                             id={`secondDay-${id}`}
//                             className={cn(
//                               "date-part",
//                               highlightedPart === "secondDay" &&
//                                 "font-bold underline"
//                             )}
//                             onMouseOver={() => handleMouseOver("secondDay")}
//                             onMouseLeave={handleMouseLeave}
//                           >
//                             {formatWithTz(date.to, "dd")}
//                           </span>{" "}
//                           <span
//                             id={`secondMonth-${id}`}
//                             className={cn(
//                               "date-part",
//                               highlightedPart === "secondMonth" &&
//                                 "font-bold underline"
//                             )}
//                             onMouseOver={() => handleMouseOver("secondMonth")}
//                             onMouseLeave={handleMouseLeave}
//                           >
//                             {formatWithTz(date.to, "LLL")}
//                           </span>
//                           ,{" "}
//                           <span
//                             id={`secondYear-${id}`}
//                             className={cn(
//                               "date-part",
//                               highlightedPart === "secondYear" &&
//                                 "font-bold underline"
//                             )}
//                             onMouseOver={() => handleMouseOver("secondYear")}
//                             onMouseLeave={handleMouseLeave}
//                           >
//                             {formatWithTz(date.to, "y")}
//                           </span>
//                         </>
//                       )}
//                     </>
//                   ) : (
//                     <>
//                       <span
//                         id="day"
//                         className={cn(
//                           "date-part",
//                           highlightedPart === "day" && "font-bold underline"
//                         )}
//                         onMouseOver={() => handleMouseOver("day")}
//                         onMouseLeave={handleMouseLeave}
//                       >
//                         {formatWithTz(date.from, "dd")}
//                       </span>{" "}
//                       <span
//                         id="month"
//                         className={cn(
//                           "date-part",
//                           highlightedPart === "month" && "font-bold underline"
//                         )}
//                         onMouseOver={() => handleMouseOver("month")}
//                         onMouseLeave={handleMouseLeave}
//                       >
//                         {formatWithTz(date.from, "LLL")}
//                       </span>
//                       ,{" "}
//                       <span
//                         id="year"
//                         className={cn(
//                           "date-part",
//                           highlightedPart === "year" && "font-bold underline"
//                         )}
//                         onMouseOver={() => handleMouseOver("year")}
//                         onMouseLeave={handleMouseLeave}
//                       >
//                         {formatWithTz(date.from, "y")}
//                       </span>
//                     </>
//                   )
//                 ) : (
//                   <span>Select a date</span>
//                 )}
//               </span>
//             </Button>
//           </PopoverTrigger>
//           {isPopoverOpen && (
//             <PopoverContent
//               className="w-auto"
//               align="start"
//               avoidCollisions={false}
//               onInteractOutside={handleClose}
//               onEscapeKeyDown={handleClose}
//               style={{
//                 maxHeight: "var(--radix-popover-content-available-height)",
//                 overflowY: "auto",
//               }}
//             >
//               <div className="flex">
//                 {numberOfMonths === 2 && (
//                   <div className="flex flex-col gap-1 border-r border-foreground/10 pr-4 text-left">
//                     {dateRanges.map(({ label, start, end }) => (
//                       <Button
//                         key={label}
//                         variant="ghost"
//                         size="default"
//                         className={cn(
//                           "justify-start hover:bg-primary/90 hover:text-background",
//                           selectedRange === label &&
//                             "bg-primary text-background hover:bg-primary/90 hover:text-background"
//                         )}
//                         onClick={() => {
//                           selectDateRange(start, end, label)
//                           setMonthFrom(start)
//                           setYearFrom(start.getFullYear())
//                           setMonthTo(end)
//                           setYearTo(end.getFullYear())
//                         }}
//                       >
//                         {label}
//                       </Button>
//                     ))}
//                   </div>
//                 )}
//                 <div className="flex flex-col">
//                   <div className="flex items-center gap-4">
//                     <div className="ml-3 flex gap-2">
//                       <Select
//                         onValueChange={(value) => {
//                           handleMonthChange(months.indexOf(value), "from")
//                           setSelectedRange(null)
//                         }}
//                         value={
//                           monthFrom ? months[monthFrom.getMonth()] : undefined
//                         }
//                       >
//                         <SelectTrigger className="w-[122px] font-medium hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0">
//                           <SelectValue placeholder="Month" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {months.map((month, idx) => (
//                             <SelectItem key={idx} value={month}>
//                               {month}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <Select
//                         onValueChange={(value) => {
//                           handleYearChange(Number(value), "from")
//                           setSelectedRange(null)
//                         }}
//                         value={yearFrom ? yearFrom.toString() : undefined}
//                       >
//                         <SelectTrigger className="w-[122px] font-medium hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0">
//                           <SelectValue placeholder="Year" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {years.map((year, idx) => (
//                             <SelectItem key={idx} value={year.toString()}>
//                               {year}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     {numberOfMonths === 2 && (
//                       <div className="flex gap-2">
//                         <Select
//                           onValueChange={(value) => {
//                             handleMonthChange(months.indexOf(value), "to")
//                             setSelectedRange(null)
//                           }}
//                           value={
//                             monthTo ? months[monthTo.getMonth()] : undefined
//                           }
//                         >
//                           <SelectTrigger className="w-[122px] font-medium hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0">
//                             <SelectValue placeholder="Month" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {months.map((month, idx) => (
//                               <SelectItem key={idx} value={month}>
//                                 {month}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <Select
//                           onValueChange={(value) => {
//                             handleYearChange(Number(value), "to")
//                             setSelectedRange(null)
//                           }}
//                           value={yearTo ? yearTo.toString() : undefined}
//                         >
//                           <SelectTrigger className="w-[122px] font-medium hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0">
//                             <SelectValue placeholder="Year" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {years.map((year, idx) => (
//                               <SelectItem key={idx} value={year.toString()}>
//                                 {year}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     )}
//                   </div>
//                   <div className="flex">
//                     <Calendar
//                       mode="range"
//                       defaultMonth={monthFrom}
//                       month={monthFrom}
//                       onMonthChange={setMonthFrom}
//                       selected={date}
//                       onSelect={handleDateSelect}
//                       numberOfMonths={numberOfMonths}
//                       showOutsideDays={false}
//                       className={className}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </PopoverContent>
//           )}
//         </Popover>
//       </>
//     )
//   }
// )

// CalendarDatePicker.displayName = "CalendarDatePicker"

"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import {
  startOfWeek,
  endOfWeek,
  subDays,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
} from "date-fns"
import { toDate, formatInTimeZone } from "date-fns-tz"
import { DateRange } from "react-day-picker"
import { cva, VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "./ui/calendar"

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const triggerVariants = cva(
  "w-auto justify-start gap-2 rounded-lg border border-input bg-background font-normal text-foreground shadow-sm transition-colors hover:bg-accent/60 hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-background",
        outline: "bg-transparent",
        ghost: "border-transparent shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/** A calendar-only value (single-date mode) */
type SingleValue = Date | undefined
/** A from/to range value (range mode) */
type RangeValue = DateRange | undefined

type CalendarDatePickerValue = SingleValue | RangeValue

function isRangeValue(value: CalendarDatePickerValue): value is RangeValue {
  return !!value && typeof value === "object" && "from" in value
}

interface Preset {
  label: string
  getValue: () => { from: Date; to: Date }
}

interface CalendarDatePickerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect">,
    VariantProps<typeof triggerVariants> {
  id?: string
  className?: string
  /** "range" (default) shows two months + presets. "single" shows one month and picks a single day. */
  mode?: "single" | "range"
  date: CalendarDatePickerValue
  closeOnSelect?: boolean
  /** Only used in "range" mode. */
  numberOfMonths?: 1 | 2
  yearsRange?: number
  placeholder?: string
  onDateSelect: (value: Date | DateRange) => void
}

export const CalendarDatePicker = React.forwardRef<
  HTMLButtonElement,
  CalendarDatePickerProps
>(
  (
    {
      id = "calendar-date-picker",
      className,
      mode = "range",
      date,
      closeOnSelect = false,
      numberOfMonths = 2,
      yearsRange = 10,
      placeholder = "Select a date",
      onDateSelect,
      variant,
      ...props
    },
    ref
  ) => {
    const isRange = mode === "range"
    const visibleMonths = isRange ? numberOfMonths : 1

    const timeZone = React.useMemo(
      () => Intl.DateTimeFormat().resolvedOptions().timeZone,
      []
    )

    const rangeValue = isRange ? (date as RangeValue) : undefined
    const singleValue = !isRange ? (date as SingleValue) : undefined

    const [isOpen, setIsOpen] = React.useState(false)
    const [selectedPreset, setSelectedPreset] = React.useState<string | null>(
      null
    )
    const [monthFrom, setMonthFrom] = React.useState<Date | undefined>(
      isRange ? rangeValue?.from : singleValue
    )
    const [yearFrom, setYearFrom] = React.useState<number | undefined>(
      (isRange ? rangeValue?.from : singleValue)?.getFullYear()
    )
    const [monthTo, setMonthTo] = React.useState<Date | undefined>(
      rangeValue?.to
    )
    const [yearTo, setYearTo] = React.useState<number | undefined>(
      rangeValue?.to?.getFullYear()
    )

    const today = new Date()
    const years = React.useMemo(
      () =>
        Array.from(
          { length: yearsRange + 1 },
          (_, i) => today.getFullYear() - Math.floor(yearsRange / 2) + i
        ),
      [yearsRange]
    )

    const rangePresets: Preset[] = React.useMemo(
      () => [
        { label: "Today", getValue: () => ({ from: today, to: today }) },
        {
          label: "Yesterday",
          getValue: () => ({ from: subDays(today, 1), to: subDays(today, 1) }),
        },
        {
          label: "This Week",
          getValue: () => ({
            from: startOfWeek(today, { weekStartsOn: 1 }),
            to: endOfWeek(today, { weekStartsOn: 1 }),
          }),
        },
        {
          label: "Last Week",
          getValue: () => ({
            from: subDays(startOfWeek(today, { weekStartsOn: 1 }), 7),
            to: subDays(endOfWeek(today, { weekStartsOn: 1 }), 7),
          }),
        },
        {
          label: "Last 7 Days",
          getValue: () => ({ from: subDays(today, 6), to: today }),
        },
        {
          label: "This Month",
          getValue: () => ({ from: startOfMonth(today), to: endOfMonth(today) }),
        },
        {
          label: "Last Month",
          getValue: () => {
            const lastMonth = subDays(startOfMonth(today), 1)
            return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
          },
        },
        {
          label: "This Year",
          getValue: () => ({ from: startOfYear(today), to: endOfYear(today) }),
        },
        {
          label: "Last Year",
          getValue: () => {
            const lastYear = subDays(startOfYear(today), 1)
            return { from: startOfYear(lastYear), to: endOfYear(lastYear) }
          },
        },
      ],
      [today]
    )

    const singlePresets: Preset[] = React.useMemo(
      () => [
        { label: "Today", getValue: () => ({ from: today, to: today }) },
        {
          label: "Yesterday",
          getValue: () => ({ from: subDays(today, 1), to: subDays(today, 1) }),
        },
        {
          label: "Tomorrow",
          getValue: () => ({ from: addDays(today, 1), to: addDays(today, 1) }),
        },
        {
          label: "In 7 Days",
          getValue: () => ({ from: addDays(today, 7), to: addDays(today, 7) }),
        },
        {
          label: "Start of Month",
          getValue: () => ({
            from: startOfMonth(today),
            to: startOfMonth(today),
          }),
        },
        {
          label: "Start of Year",
          getValue: () => ({ from: startOfYear(today), to: startOfYear(today) }),
        },
      ],
      [today]
    )

    const presets = isRange ? rangePresets : singlePresets

    const handleClose = () => setIsOpen(false)
    const handleToggle = () => setIsOpen((prev) => !prev)

    const handleClear = () => {
      setSelectedPreset(null)
      setMonthFrom(undefined)
      setYearFrom(undefined)
      setMonthTo(undefined)
      setYearTo(undefined)
      onDateSelect(
        isRange ? ({ from: undefined, to: undefined } as DateRange) : (undefined as unknown as Date)
      )
    }

    const applyPreset = (preset: Preset) => {
      const { from, to } = preset.getValue()
      const start = startOfDay(toDate(from, { timeZone }))
      const end = isRange ? endOfDay(toDate(to, { timeZone })) : start

      setSelectedPreset(preset.label)
      setMonthFrom(start)
      setYearFrom(start.getFullYear())
      setMonthTo(end)
      setYearTo(end.getFullYear())

      onDateSelect(isRange ? { from: start, to: end } : start)
      if (closeOnSelect) setIsOpen(false)
    }

    const handleRangeSelect = (range: DateRange | undefined) => {
      setSelectedPreset(null)
      if (!range?.from) return

      const from = startOfDay(toDate(range.from, { timeZone }))
      const to = range.to ? endOfDay(toDate(range.to, { timeZone })) : from

      setMonthFrom(from)
      setYearFrom(from.getFullYear())
      setMonthTo(to)
      setYearTo(to.getFullYear())
      onDateSelect({ from, to })
    }

    const handleSingleSelect = (value: Date | undefined) => {
      setSelectedPreset(null)
      if (!value) return

      const day = startOfDay(toDate(value, { timeZone }))
      setMonthFrom(day)
      setYearFrom(day.getFullYear())
      onDateSelect(day)
      if (closeOnSelect) setIsOpen(false)
    }

    const handleMonthChange = (newMonthIndex: number, part: "from" | "to") => {
      setSelectedPreset(null)
      if (part === "from" && yearFrom !== undefined) {
        const newMonth = new Date(yearFrom, newMonthIndex, 1)
        setMonthFrom(newMonth)
        if (!isRange) {
          const day = singleValue?.getDate() ?? 1
          onDateSelect(new Date(yearFrom, newMonthIndex, day))
        }
      } else if (part === "to" && yearTo !== undefined) {
        setMonthTo(new Date(yearTo, newMonthIndex, 1))
      }
    }

    const handleYearChange = (newYear: number, part: "from" | "to") => {
      setSelectedPreset(null)
      if (part === "from") {
        const month = monthFrom?.getMonth() ?? 0
        setYearFrom(newYear)
        setMonthFrom(new Date(newYear, month, 1))
        if (!isRange) {
          const day = singleValue?.getDate() ?? 1
          onDateSelect(new Date(newYear, month, day))
        }
      } else {
        const month = monthTo?.getMonth() ?? 0
        setYearTo(newYear)
        setMonthTo(new Date(newYear, month, 1))
      }
    }

    const formatWithTz = (d: Date, fmt: string) =>
      formatInTimeZone(d, timeZone, fmt)

    const renderLabel = () => {
      if (isRange) {
        if (!rangeValue?.from) return <span>{placeholder}</span>
        if (!rangeValue.to)
          return <span>{formatWithTz(rangeValue.from, "MMM d, yyyy")}</span>
        return (
          <span>
            {formatWithTz(rangeValue.from, "MMM d, yyyy")}
            <span className="mx-1.5 text-muted-foreground">–</span>
            {formatWithTz(rangeValue.to, "MMM d, yyyy")}
          </span>
        )
      }
      if (!singleValue) return <span>{placeholder}</span>
      return <span>{formatWithTz(singleValue, "MMM d, yyyy")}</span>
    }

    const hasValue = isRange ? !!rangeValue?.from : !!singleValue

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            ref={ref}
            {...props}
            // variant="outline"
            className={cn(triggerVariants({ variant, className }))}
            onClick={handleToggle}
            suppressHydrationWarning
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            {renderLabel()}
            {hasValue && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear date"
                className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
          </Button>
        </PopoverTrigger>

        {isOpen && (
          <PopoverContent
            className="w-auto overflow-hidden rounded-xl border p-0 shadow-lg"
            align="start"
            avoidCollisions={false}
            onInteractOutside={handleClose}
            onEscapeKeyDown={handleClose}
            style={{
              maxHeight: "var(--radix-popover-content-available-height)",
              overflowY: "auto",
            }}
          >
            <div className="flex flex-col sm:flex-row">
              {/* Presets sidebar */}
              <div className="flex shrink-0 flex-row gap-1 overflow-x-auto border-b p-2 sm:w-40 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0 sm:p-3">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "shrink-0 justify-start whitespace-nowrap rounded-md font-normal",
                      selectedPreset === preset.label
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              {/* Calendar + month/year controls */}
              <div className="flex flex-col p-3">
                <div className="flex flex-wrap items-center gap-3 pb-2">
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) =>
                        handleMonthChange(months.indexOf(value), "from")
                      }
                      value={monthFrom ? months[monthFrom.getMonth()] : undefined}
                    >
                      <SelectTrigger className="h-8 w-[112px] rounded-md text-sm font-medium">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(value) =>
                        handleYearChange(Number(value), "from")
                      }
                      value={yearFrom ? yearFrom.toString() : undefined}
                    >
                      <SelectTrigger className="h-8 w-[92px] rounded-md text-sm font-medium">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isRange && visibleMonths === 2 && (
                    <>
                      <Separator orientation="vertical" className="hidden h-6 sm:block" />
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(value) =>
                            handleMonthChange(months.indexOf(value), "to")
                          }
                          value={monthTo ? months[monthTo.getMonth()] : undefined}
                        >
                          <SelectTrigger className="h-8 w-[112px] rounded-md text-sm font-medium">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          onValueChange={(value) =>
                            handleYearChange(Number(value), "to")
                          }
                          value={yearTo ? yearTo.toString() : undefined}
                        >
                          <SelectTrigger className="h-8 w-[92px] rounded-md text-sm font-medium">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                {isRange ? (
                  <Calendar
                    mode="range"
                    defaultMonth={monthFrom}
                    month={monthFrom}
                    onMonthChange={setMonthFrom}
                    selected={rangeValue}
                    onSelect={handleRangeSelect}
                    numberOfMonths={visibleMonths}
                    showOutsideDays={false}
                    className={cn("rounded-md", className)}
                  />
                ) : (
                  <Calendar
                    mode="single"
                    defaultMonth={monthFrom}
                    month={monthFrom}
                    onMonthChange={setMonthFrom}
                    selected={singleValue}
                    onSelect={handleSingleSelect}
                    numberOfMonths={1}
                    showOutsideDays={false}
                    className={cn("rounded-md", className)}
                  />
                )}

                <div className="mt-2 flex items-center justify-end gap-2 border-t pt-3">
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    Clear
                  </Button>
                  <Button size="sm" onClick={handleClose}>
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        )}
      </Popover>
    )
  }
)

CalendarDatePicker.displayName = "CalendarDatePicker"