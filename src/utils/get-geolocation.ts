import { HEADERS } from "@tanstack/react-start/server";

/**
 * Get user country code in order to make seach basing on the current user location
 * @returns country code
 */
export async function getGeolocation() {
  const ipCountry = (await headers()).get("x-vercel-ip-country") as
    | string
    | null;

  return ipCountry ?? "UG";
}
