import { AutoComplete } from "@/components/ui/autocomplete";
import {
  getLocationSuggestions,
  LocationSuggestion,
  getLocationDetailsByPlaceId,
  PlaceDetails,
} from "@/server/actions/location";
import { Prettify } from "@/types";
import React from "react";
import { Field, FieldLabel } from "./ui/field";

type LocationAutoCompleteProps = {
  onPlaceLoaded: (place?: Prettify<PlaceDetails> | null) => void;
  label?: string;
};

export function LocationAutoComplete({
  onPlaceLoaded,
  label,
}: LocationAutoCompleteProps) {
  const [selectedPlaceId, setSelectedPlaceId] = React.useState<
    string | undefined
  >();
  const [sessionId, setSessionId] = React.useState<string>(crypto.randomUUID());

  return (
    <Field>
      <FieldLabel htmlFor={label}>{label}</FieldLabel>
      <AutoComplete<LocationSuggestion>
        fetcher={async (query) => {
          if (!query || query.length < 3) return [];
          const { data } = await getLocationSuggestions({
            query,
            sessionId,
          });
          return data ?? [];
        }}
        renderOption={(location) => (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="font-medium">{location.name}</div>
            </div>
          </div>
        )}
        getOptionValue={(location) => location.placeId}
        getDisplayValue={(location) => (
          <div className="flex items-center gap-2 text-left">
            <div className="flex flex-col leading-tight">
              <div className="font-medium">{location.name}</div>
            </div>
          </div>
        )}
        notFound={
          <div className="py-6 text-center text-sm">No Locations found</div>
        }
        label="Location"
        placeholder="Search location..."
        value={selectedPlaceId}
        onChange={async (location) => {
          setSelectedPlaceId(location?.placeId);
          if (location) {
            const { data: placeDetails } = await getLocationDetailsByPlaceId({
              placeId: location!.placeId,
              sessionId,
            });
            onPlaceLoaded(placeDetails);
            // create a new session id for the next autocomplete or place details request
            //  because after getting place details the session id becomes invalid
            // TODO: use new session only when the pickup-location changes
            const session = crypto.randomUUID();
            setSessionId(session);
          } else {
            onPlaceLoaded();
          }
        }}
      />
    </Field>
  );
}
