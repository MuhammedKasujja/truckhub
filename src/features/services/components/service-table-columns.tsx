import { ActionButton } from "@/components/ui/action-button"
import { Button } from "@/components/ui/button"
import { Service, ServiceGroup } from "@/features/services/types"
import { formatMoney } from "@/lib/format"
import { ColumnDef } from "@tanstack/react-table"
import { EyeIcon, EditIcon, Trash2Icon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useTranslation } from "@/i18n"
import { Can } from "@/components/has-permission"

export function getServiceTableColumns(): ColumnDef<ServiceGroup>[] {
  return [
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        return <Button variant={"link"}>{row.original.category}</Button>
      },
      size: 120,
    },
    {
      accessorKey: "services",
      header: "Services",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            {row.original.services.map((service) => (
              <ServiceListItem key={service.id} service={service} />
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: "is_truck",
      header: "Vehicle",
      cell: ({ row }) => {
        return <p>{row.original.is_truck ? "Truck" : "Normal"}</p>
      },
      size: 80,
    },
    {
      id: "actions",
      cell: () => {
        return (
          <div className="flex gap-2">
            <Button variant={"outline"} size={"icon"}>
              <EyeIcon />
            </Button>
            <Button variant={"outline"} size={"icon"}>
              {/* <Link to={`/services/${row.original.id}/edit`}> */}
              <EditIcon />
              {/* </Link> */}
            </Button>
            <ActionButton
              variant={"destructive"}
              size={"icon"}
              requireAreYouSure
              action={async () => {
                // const { isSuccess, error, message } = await deleteServiceById(
                //   row.original.id,
                // );
                // if (isSuccess) {
                //   toast.success(message);
                //   return { error: false };
                // } else {
                return { error: true, message: "Not implemented yet...." }
                // }
              }}
            >
              <Trash2Icon />
            </ActionButton>
          </div>
        )
      },
      size: 120,
    },
  ]
}

function ServiceListItem({ service }: { service: Service }) {
  const tr = useTranslation()
  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Can permission="services:edit" fallbackText={`${service.name}`}>
          <Button asChild variant={"outline"}>
            <Link
              to={`/services/$serviceId/edit`}
              params={{ serviceId: service.id }}
            >
              {service.name}
            </Link>
          </Button>
        </Can>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-64 flex-col gap-0.5">
        <div className="grid grid-cols-1 gap-4">
          <div>
            {service.category} - {service.name}
          </div>
          <div>
            {tr("services.price")}: {formatMoney(service.base_fare)}
          </div>
          <div>
            {tr("services.last_price")}: {formatMoney(service.min_fare)}
          </div>
          {/* <div>Tax fee: {formatMoney(service.tax_fee)}</div> */}
          {!service.is_truck && (
            <div>
              {tr("services.seating_capacity")}: {service.seats}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
