import { createServerFn } from "@tanstack/react-start"
import { getRequestHeader } from "@tanstack/react-start/server"

/**
 * Get user country code in order to make seach basing on the current user location
 * @returns country code
 */
export const getGeolocation = createServerFn().handler(async () => {
  const ipCountry = getRequestHeader("x-vercel-ip-country") as string | null

  return ipCountry ?? "UG"
})
