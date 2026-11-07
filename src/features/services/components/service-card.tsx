import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  MoreHorizontal,
  PencilIcon,
  Truck,
  Users,
} from "lucide-react"
import { deleteServiceFn } from "../services"
import type { Service } from "@/features/services/types"
import type { VehicleType } from "@/features/settings/vehicle-config/vehicle-categories/enums"
import { vehicleTypeMeta } from "@/features/settings/vehicle-config/vehicle-categories/vehicle-type-meta"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { useTranslation } from "@/i18n"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export { vehicleTypeMeta }

/** "Isuzu FVR · 2018+" for model pricing, else the vehicle category. */
export function serviceVehicleLabel(service: Service) {
  const model = service.car_model
  if (model) {
    return [
      `${model.car_brand.name} ${model.name}`,
      model.manufacture_year ? `${model.manufacture_year}+` : null,
    ]
      .filter(Boolean)
      .join(" · ")
  }
  return service.vehicle_category?.name ?? service.category
}

type ServiceCardProps = {
  service: Service
  /** Show the edit / delete actions (off inside pickers). */
  showActions?: boolean
}

export function ServiceCard({ service, showActions = true }: ServiceCardProps) {
  const tr = useTranslation()
  const [imageFailed, setImageFailed] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const queryInvalidator = useQueryInvalidator()

  const type = vehicleTypeMeta[service.source] as
    | (typeof vehicleTypeMeta)[VehicleType]
    | undefined
  const TypeIcon = type?.icon ?? Truck
  const showImage = !!service.image_url && !imageFailed
  const hasMinFare =
    Number(service.min_fare) > 0 &&
    Number(service.min_fare) !== Number(service.base_fare)

  const remove = useMutation({
    mutationFn: () => deleteServiceFn({ data: { id: service.id } }),
    onSuccess: ({ isSuccess, message, error }) => {
      if (!isSuccess) {
        toast.error(error?.message ?? "Couldn't delete the service")
        return
      }
      toast.success(message ?? "Service deleted")
      queryInvalidator.services.list.invalidate()
      setConfirmDelete(false)
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-16/10 border-b bg-muted/40">
        {showImage ? (
          <img
            src={service.image_url}
            alt={service.display_name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="size-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/40">
            <TypeIcon className="size-14" strokeWidth={1.25} />
          </div>
        )}
        <Badge
          variant="outline"
          className="absolute top-3 left-3 bg-background/90 backdrop-blur"
        >
          <TypeIcon />
          {type?.label ?? service.source}
        </Badge>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight">
            {service.display_name}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {serviceVehicleLabel(service)}
          </p>
          {service.description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
              {service.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {tr("services.base_fare")}
            </p>
            <p className="text-xl font-bold tracking-tight tabular-nums">
              {formatMoney(service.base_fare)}
            </p>
            {hasMinFare && (
              <p className="text-xs text-muted-foreground tabular-nums">
                {tr("services.min_fare")}: {formatMoney(service.min_fare)}
              </p>
            )}
          </div>
          {!service.is_truck && service.seats > 0 && (
            <span
              className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground"
              title={tr("services.seating_capacity")}
            >
              <Users className="size-3.5" />
              {service.seats}
            </span>
          )}
        </div>
      </div>

      {showActions && (
        <Can permission="services:edit">
          <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2.5">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link
                to="/services/$serviceId/edit"
                params={{ serviceId: service.id }}
              >
                <PencilIcon />
                Edit
              </Link>
            </Button>
            <Can permission="services:delete">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`More actions for ${service.display_name}`}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setConfirmDelete(true)}
                  >
                    <ActionIcon action="delete" />
                    Delete service
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Can>
          </div>
        </Can>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        isLoading={remove.isPending}
        title={`Delete ${service.display_name}?`}
        description="This removes the service and its prices. This can't be undone."
        confirmLabel="Delete service"
        onConfirm={() => remove.mutate()}
      />
    </article>
  )
}

/** Grid that adapts to the space it's given (page or dialog). */
export function ServiceGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="@container">
      <div
        className={cn(
          "grid grid-cols-1 gap-4 @lg:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
