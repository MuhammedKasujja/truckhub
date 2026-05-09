import { Card, CardContent } from "@/components/ui/card";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapRoute,
  MarkerTooltip,
  MapControls,
  MapRef,
} from "@/components/ui/map";
import { MAP_LIGHT_STYLE_URL } from "@/config/constants";
import React, { useMemo } from "react";
import { RideRequest } from "../types";

type RideActiveListProps = {
  rides: RideRequest[];
};

export function RideActiveList({ rides }: RideActiveListProps) {
  const mapRef = React.useRef<MapRef>(null);

  const checkpoints = useMemo(() => {
    return rides.map((ride) => ({
      lng: ride.origin,
      lat: ride.origin,
      name: ride.origin,
    }));
  }, [rides]);

  return (
    <Card>
      <CardContent className="h-200 w-full">
        <Map
          ref={mapRef}
          center={[checkpoints[0].lng, checkpoints[0].lat]}
          zoom={11.0}
          styles={{
            light: MAP_LIGHT_STYLE_URL,
          }}
        >
          {checkpoints.map((stop) => (
            <MapMarker key={stop.name} longitude={stop.lng} latitude={stop.lat}>
              <MarkerContent>
                <div className="size-4.5 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-semibold">
                  P
                </div>
              </MarkerContent>
              <MarkerTooltip>{stop.name}</MarkerTooltip>
            </MapMarker>
          ))}
          <MapControls position="bottom-right" showZoom showCompass />
        </Map>
      </CardContent>
    </Card>
  );
}
