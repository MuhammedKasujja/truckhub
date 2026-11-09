import { Link } from "@tanstack/react-router"
import { MailIcon, PhoneIcon, StarIcon, TruckIcon } from "lucide-react"
import { DriverActionsMenu } from "./driver-actions-menu"
import type { DriverSummary } from "../types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate, generateAvatorFallback } from "@/lib/format"
import { cn } from "@/lib/utils"

export function DriverAvatar({
  driver,
  size,
}: {
  driver: DriverSummary
  size?: "default" | "sm" | "lg"
}) {
  return (
    <Avatar size={size}>
      <AvatarImage src={driver.photo_url} alt={driver.full_name} />
      <AvatarFallback>{generateAvatorFallback(driver.full_name)}</AvatarFallback>
    </Avatar>
  )
}

/** The driver's rating, or nothing while they have none. */
export function DriverRating({
  rating,
  className,
}: {
  rating: number
  className?: string
}) {
  if (!rating) return null
  return (
    <span
      className={cn("inline-flex items-center gap-1 tabular-nums", className)}
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      <StarIcon className="size-3.5 fill-current text-amber-500" />
      {rating.toFixed(1)}
    </span>
  )
}

/** The driver's vehicle as "Display name · plate", or a muted placeholder. */
export function DriverVehicle({ driver }: { driver: DriverSummary }) {
  if (!driver.vehicle) {
    return <span className="text-muted-foreground">No vehicle assigned</span>
  }
  return (
    <span className="truncate">
      {driver.vehicle.display_name}
      {driver.vehicle.plate_number && (
        <span className="text-muted-foreground">
          {" · "}
          {driver.vehicle.plate_number}
        </span>
      )}
    </span>
  )
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <dt>
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="min-w-0 truncate">{children}</dd>
    </div>
  )
}

export function DriverCard({ driver }: { driver: DriverSummary }) {
  return (
    <article className="flex flex-col rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <DriverAvatar driver={driver} size="lg" />
        <div className="min-w-0 flex-1">
          <Link
            to="/drivers/$driverId/view"
            params={{ driverId: driver.id }}
            className="block truncate text-sm font-semibold outline-none hover:underline focus-visible:underline"
          >
            {driver.full_name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {driver.number || driver.user_name || "No driver number"}
          </p>
        </div>
        <DriverActionsMenu driver={driver} />
      </div>

      <dl className="flex flex-1 flex-col gap-2 border-t px-4 py-3 text-sm">
        <DetailRow icon={PhoneIcon} label="Phone">
          {driver.phone ? (
            <a href={`tel:${driver.phone}`} className="hover:underline">
              {driver.phone}
            </a>
          ) : (
            <span className="text-muted-foreground">No phone</span>
          )}
        </DetailRow>
        <DetailRow icon={MailIcon} label="Email">
          <a href={`mailto:${driver.email}`} className="hover:underline">
            {driver.email}
          </a>
        </DetailRow>
        <DetailRow icon={TruckIcon} label="Vehicle">
          <DriverVehicle driver={driver} />
        </DetailRow>
      </dl>

      <div className="flex items-center justify-between gap-2 border-t px-4 py-2.5 text-xs text-muted-foreground">
        <span>Joined {formatDate(driver.created_at)}</span>
        <DriverRating rating={driver.rating} className="text-foreground" />
      </div>
    </article>
  )
}

export function DriverCardSkeleton() {
  return <div className="h-52 animate-pulse rounded-xl bg-muted/60" />
}
