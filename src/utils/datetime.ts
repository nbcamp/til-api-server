import { formatISO, parseISO } from "date-fns";

export function dateToString(date: Date): string {
  return formatISO(date);
}

export function stringToDate(date: string): Date {
  return parseISO(date);
}
