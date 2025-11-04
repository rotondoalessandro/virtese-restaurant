// lib/reservationWindow.ts
import { addMinutes } from "date-fns";

export type RuleLike = {
  seatDuration?: number | null;
  bufferBefore?: number | null;
  bufferAfter?: number | null;
};

export function computeAllocationWindow(dateTime: Date, rule?: RuleLike) {
  const seatDuration = rule?.seatDuration ?? 90;
  const bufferBefore = rule?.bufferBefore ?? 0;
  const bufferAfter  = rule?.bufferAfter  ?? 0;

  const start_at = addMinutes(dateTime, -bufferBefore);
  const end_at   = addMinutes(dateTime, seatDuration + bufferAfter);
  return { start_at, end_at };
}
