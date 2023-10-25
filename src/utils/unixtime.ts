import { getUnixTime, fromUnixTime } from "date-fns";

export function toUnixTime(date: Date) {
  return getUnixTime(date);
}

export function toDate(unixTime: number) {
  return fromUnixTime(unixTime);
}
