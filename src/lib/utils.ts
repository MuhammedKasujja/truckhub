import { DateTime } from "luxon";
export { cn } from "cn";

export function getDateTime() {
  return DateTime.now();
}

export const systemDateTime = getDateTime();

export const now = getDateTime;
