"use client";

import { useEffect, useState } from "react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapRoute,
  MarkerLabel,
  MapRef,
} from "@/components/ui/map";
import { Loader2, Clock, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchRoutes, RouteData } from "@/server/actions/location";
import { formatDistance, formatDuration } from "@/lib/format";
import { MAP_LIGHT_STYLE_URL } from "@/config/constants";
import React from "react";

const start = { name: "Amsterdam", lng: 4.9041, lat: 52.3676 };
const end = { name: "Rotterdam", lng: 4.4777, lat: 51.9244 };

export function LiveRideMap() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = React.useRef<MapRef>(null);

  useEffect(() => {
    fetchRoutes({ origin: start, destination: end })
      .then((routeData) => {
        setRoutes(routeData ?? []);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Sort routes: non-selected first, selected last (renders on top)
  const sortedRoutes = routes
    .map((route, index) => ({ route, index }))
    .sort((a, b) => {
      if (a.index === selectedIndex) return 1;
      if (b.index === selectedIndex) return -1;
      return 0;
    });

  return (
    <div className="h-125 w-full relative">
      <Map
        ref={mapRef}
        center={[4.69, 52.14]}
        zoom={8.5}
        styles={{
          light: MAP_LIGHT_STYLE_URL,
        }}
      >
        {sortedRoutes.map(({ route, index }) => {
          const isSelected = index === selectedIndex;
          return (
            <MapRoute
              key={index}
              coordinates={route.coordinates}
              color={isSelected ? "#6366f1" : "#94a3b8"}
              width={isSelected ? 6 : 5}
              opacity={isSelected ? 1 : 0.6}
              onClick={() => setSelectedIndex(index)}
            />
          );
        })}

        <MapMarker longitude={start.lng} latitude={start.lat}>
          <MarkerContent>
            <div className="size-5 rounded-full bg-green-500 border-2 border-white shadow-lg" />
            <MarkerLabel position="top">{start.name}</MarkerLabel>
          </MarkerContent>
        </MapMarker>

        <MapMarker longitude={end.lng} latitude={end.lat}>
          <MarkerContent>
            <div className="size-5 rounded-full bg-red-500 border-2 border-white shadow-lg" />
            <MarkerLabel position="bottom">{end.name}</MarkerLabel>
          </MarkerContent>
        </MapMarker>
      </Map>

      {routes.length > 0 && (
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {routes.map((route, index) => {
            const isActive = index === selectedIndex;
            const isFastest = index === 0;
            return (
              <Button
                key={index}
                variant={isActive ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedIndex(index)}
                className="justify-start gap-3"
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span className="font-medium">
                    {formatDuration(route.duration)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs opacity-80">
                  <Route className="size-3" />
                  {formatDistance(route.distance)}
                </div>
                {isFastest && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Fastest
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
