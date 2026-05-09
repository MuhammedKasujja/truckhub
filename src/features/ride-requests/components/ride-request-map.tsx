"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerTooltip,
  Map,
  MapRef,
} from "@/components/ui/map";
import { MAP_LIGHT_STYLE_URL } from "@/config/constants";
import { formatDistance, formatDuration } from "@/lib/format";
import { fetchRoutes, RouteData } from "@/server/actions/location";
import React, { useEffect } from "react";

type RideRequestMapProps = {
  origin: {
    lat: number;
    lng: number;
    name: string;
  };
  destination: {
    lat: number;
    lng: number;
    name: string;
  };
  waypoints: {
    lat: number;
    lng: number;
    name: string;
  }[];
};

export function RideRequestMap({
  origin,
  destination,
  waypoints = [],
}: RideRequestMapProps) {
  const mapRef = React.useRef<MapRef>(null);
  const [routeData, setRouteData] = React.useState<RouteData[] | undefined>();

  useEffect(() => {
    fetchRoutes({ origin, destination, waypoints }).then((data) => {
      setRouteData(data);
      mapRef.current?.setPitch(30)
    });
  }, [origin, destination, waypoints]);

  return (
    <Card>
      <CardContent className="h-100 w-full">
        <Map
          ref={mapRef}
          center={[origin.lng, origin.lat]}
          zoom={11.0}
          styles={{
            light: MAP_LIGHT_STYLE_URL,
          }}
        >
          <MapRoute
            coordinates={routeData?.[0].coordinates ?? []}
            color="#3b82f6"
            width={5}
            opacity={1}
          />
          {[origin, destination].map((stop, index) => (
            <MapMarker key={stop.name} longitude={stop.lng} latitude={stop.lat}>
              {/* <MarkerContent>
                  <div className="cursor-move">
                    <MapPin
                      className="fill-black stroke-white dark:fill-white"
                      size={28}
                    >{index == 0 ? "P" : "D"}</MapPin>
                  </div>
                </MarkerContent> */}
              <MarkerContent>
                <div className="size-4.5 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-semibold">
                  {index == 0 ? "P" : "D"}
                </div>
              </MarkerContent>
              <MarkerTooltip>{stop.name}</MarkerTooltip>
            </MapMarker>
          ))}
          <MapControls position="bottom-right" showZoom showCompass />
        </Map>
      </CardContent>
      <CardFooter className="gap-2">
        <div>Distance: {formatDistance(routeData?.[0].distance ?? 0)}</div>
        <div>Duration: {formatDuration(routeData?.[0].duration ?? 0)}</div>
      </CardFooter>
    </Card>
  );
}
