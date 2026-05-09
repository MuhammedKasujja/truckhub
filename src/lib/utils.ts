import { DateTime } from "luxon";
import { twMerge } from "tailwind-merge"
import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDateTime() {
  return DateTime.now();
}

export const systemDateTime = getDateTime();

export const now = getDateTime;
