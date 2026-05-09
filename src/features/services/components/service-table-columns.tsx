import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteServiceById } from "@/features/services/service";
import { Service, ServiceGroup } from "@/features/services/types";
import { formatPrice } from "@/lib/format";
import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon, EditIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function getServiceTableColumns(): ColumnDef<ServiceGroup>[] {
  return [
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        return <Button variant={"link"}>{row.original.category}</Button>;
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
        );
      },
    },
    {
      accessorKey: "is_truck",
      header: "Vehicle",
      cell: ({ row }) => {
        return <p>{row.original.is_truck ? "Truck" : "Normal"}</p>;
      },
      size: 80,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button variant={"outline"} size={"icon"}>
              <EyeIcon />
            </Button>
            <Button variant={"outline"} size={"icon"}>
              {/* <Link href={`/services/${row.original.id}/edit`}> */}
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
                return { error: true, message: "Not implemented yet...." };
                // }
              }}
            >
              <Trash2Icon />
            </ActionButton>
          </div>
        );
      },
      size: 120,
    },
  ];
}

function ServiceListItem({ service }: { service: Service }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant={"outline"}>
          <Link href={`/services/${service.id}/edit`}>{service.name}</Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" align="center">
        <div className="grid grid-cols-1 gap-2">
          <div>
            {service.category} - {service.name}
          </div>
          <div>Base fee: {formatPrice(service.base_fare)}</div>
          <div>Booking fee: {formatPrice(service.booking_fee)}</div>
          <div>Tax fee: {formatPrice(service.tax_fee)}</div>
          {!service.is_truck && <div>Seats: {service.seats}</div>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
