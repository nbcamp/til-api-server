import { getUnixTime, fromUnixTime as _fromUnixTime } from "date-fns";

export function toUnixTime(date: Date) {
  return getUnixTime(date);
}

export function fromUnixTime(unixTime: number) {
  return _fromUnixTime(unixTime);
}
