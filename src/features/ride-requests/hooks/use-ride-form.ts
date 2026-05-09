import z from "zod";
import React from "react";
import { toast } from "sonner";
import { useTranslation } from "@/i18n";
import { Service } from "@/features/services/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { RideRequestCreateSchema } from "@/features/ride-requests/schemas";
import { LocationDistanceTime, PlaceDetails } from "@/server/actions/location";
import {
  createRideRequest,
  computeRideRequestEsimatedFare,
} from "@/features/ride-requests/service";

export function useRideForm(services: Service[]) {
  const [locationDistanceTime, setLocationDistanceTime] = React.useState<
    LocationDistanceTime | undefined
  >(undefined);

  const tr = useTranslation();

  const form = useForm<z.infer<typeof RideRequestCreateSchema>>({
    resolver: zodResolver(RideRequestCreateSchema),
    defaultValues: { checkpoints: [] },
  });

  async function onSubmit(values: z.infer<typeof RideRequestCreateSchema>) {
    const { isSuccess, error } = await createRideRequest(values);
    if (isSuccess) {
      toast.success(`${tr("trips.trip_created_successfully")}`);
    } else {
      toast.error(error!.message);
    }
  }

  const serviceId = form.watch("service_id");

  const service = React.useMemo(() => {
    return services.find((ele) => ele.id === serviceId);
  }, [serviceId, services]);

  async function computeRideCost() {
    const pickup = form.getValues("pickup_location");
    const destination = form.getValues("destination_location");

    const serviceId = form.getValues("service_id");
    if (!serviceId) {
      toast.error("Please select a service to continue");
      form.setError("service_id", {
        message: "Please select a service to continue",
      });
      return;
    }
    const { data, error, isSuccess } = await computeRideRequestEsimatedFare({
      serviceId: serviceId,
      origin: { lat: pickup.lat, lng: pickup.lng },
      destination: { lat: destination.lat, lng: destination.lng },
    });

    if (error) {
      toast.error(error.message);
    }

    if (isSuccess) {
      setLocationDistanceTime(data);
      if (data) {
        form.setValue("estimated_distance", data.distance);
        form.setValue("polyline_route", data.polyline);
        // base 10 automatically returns the first numeric string when is encounters
        // the first char `s` in the string `14245s`
        form.setValue("estimated_time", data.duration);
      }
    }
  }

  React.useEffect(() => {
    const pickup = form.getValues("pickup_location");
    const destination = form.getValues("destination_location");
    setLocationDistanceTime(undefined);
    form.setValue("estimated_distance", undefined);
    form.setValue("polyline_route", undefined);
    form.setValue("estimated_time", undefined);

    if (pickup && destination) {
      computeRideCost().then(() => {
        console.log("Ride updated");
      });
    }
  }, [serviceId]);

  const { fields: checkpoints, append } = useFieldArray({
    control: form.control,
    name: "checkpoints",
  });

  function appendCheckpoint() {
    const destination = form.getValues("destination_location");
    if (!destination) {
      toast.error("First add destination");
      return;
    }
    append({
      name: destination.name,
      lat: destination.lat,
      lng: destination.lng,
      distance: 900,
      time: 8999,
      position: checkpoints.length + 1,
      estimated_fare: 6788,
    });
    form.setValue("destination_location", {
      name: "",
      lat: 0,
      lng: 0,
      place_id: "",
    });
  }

  async function onDestinationChanged(place?: PlaceDetails | null) {
    if (place) {
      console.log("Place Destination Details", place);
      form.setValue("destination_location", {
        name: place.address1,
        lat: place.lat,
        lng: place.lng,
        place_id: place.placeId,
      });
      await computeRideCost();
    }
  }

  function onPickupChanged(place?: PlaceDetails | null) {
    setLocationDistanceTime(undefined);
    if (place) {
      form.setValue("pickup_location", {
        name: place.address1,
        lat: place.lat,
        lng: place.lng,
        place_id: place.placeId,
      });
    }
  }

  return {
    form,
    appendCheckpoint,
    service,
    locationDistanceTime,
    onPickupChanged,
    checkpoints,
    onSubmit,
    onDestinationChanged,
  };
}
