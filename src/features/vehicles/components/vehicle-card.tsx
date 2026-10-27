import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Cog,
  Fuel,
  Gauge,
  Palette,
  Phone,
  Users,
  UserRound,
} from "lucide-react"
import { Vehicle } from "../types"
import { formatNumber } from "@/lib/format"

// "metallicSilver" -> "Metallic Silver", "on_trip" -> "On trip"
const humanize = (value: string) => {
  const spaced = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

// Fix known data typos before display
const engineLabel = (engine: string) =>
  engine.toLowerCase() === "desel" ? "Diesel" : humanize(engine)

// Status -> shadcn Badge variant (all colors come from theme tokens)
const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  available: "default",
  on_trip: "secondary",
  maintenance: "destructive",
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

/* ---------- Small pieces ---------- */

function ColorText({ name, label }: { name: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Palette className="size-4 text-muted-foreground" aria-hidden />
      <span className="text-muted-foreground">{label}</span>
      <span>{humanize(name)}</span>
    </span>
  )
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

/* ---------- Card ---------- */

export function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  const statusVariant = STATUS_VARIANT[v.status] ?? "outline"

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardDescription>
              {v.number} · {v.category.name}
            </CardDescription>
            <CardTitle className="mt-1 truncate text-lg">
              {v.car_model.car_brand.name} {v.car_model.name}
            </CardTitle>
          </div>
          <Badge variant={statusVariant} className="shrink-0">
            {humanize(v.status)}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md border-2 border-foreground bg-background px-2 py-0.5 font-mono text-sm font-semibold tracking-wider">
            {v.plate_number}
          </span>
          {v.second_plate_number && (
            <span className="rounded-md border-2 border-foreground bg-background px-2 py-0.5 font-mono text-sm font-semibold tracking-wider">
              {v.second_plate_number}
            </span>
          )}
          <span className="text-sm text-muted-foreground">{v.year}</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
          <Spec
            icon={Fuel}
            label="Engine"
            value={`${engineLabel(v.engine_type)} · ${v.cylinders} cyl`}
          />
          <Spec icon={Cog} label="Gearbox" value={humanize(v.gearbox)} />
          <Spec
            icon={Gauge}
            label="Drive train · Axles"
            value={`${v.drive_train.name} · ${v.total_axles}`}
          />
          <Spec icon={Users} label="Seats" value={v.seats ?? "Not set"} />
          <Spec
            icon={Fuel}
            label="Tank capacity"
            value={`${formatNumber(v.tank_capacity)} L`}
          />
          <Spec
            icon={Gauge}
            label="Fuel rate"
            value={formatNumber(v.fuel_consumption_rate)}
          />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <ColorText name={v.color} label="Exterior" />
          <ColorText name={v.interior_color} label="Interior" />
        </div>

        {v.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {v.features.map((f) => (
              <Badge key={f.id} variant="outline" className="font-normal">
                {f.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="pt-4">
        {v.driver ? (
          <div className="flex w-full items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials(v.driver.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{v.driver.name}</p>
              <a
                href={`tel:${v.driver.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Phone className="size-3" />
                {v.driver.phone}
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserRound className="size-4" />
            No driver assigned
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
