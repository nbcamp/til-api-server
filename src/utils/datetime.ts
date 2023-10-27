import { getUnixTime, fromUnixTime } from "date-fns";

export function dateToUnixTime(date: Date): number;
export function dateToUnixTime(date: Date | undefined | null): null;
export function dateToUnixTime(date?: Date | null): number | null {
  return date ? getUnixTime(date) : null;
}

export function unixTimeToDate(unixtime: number): Date;
export function unixTimeToDate(unixtime: number | undefined | null): null;
export function unixTimeToDate(unixtime?: number | null): Date | null {
  return unixtime ? fromUnixTime(unixtime) : null;
}
