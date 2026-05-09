import polyline from "@mapbox/polyline";

export function generateCoordnatesFromPolyline(
  strPolyline: string | undefined,
): [number, number][] {
  if (!strPolyline) return [];
  return polyline.decode(strPolyline).map(([lat, lng]) => [lng, lat]);
}
