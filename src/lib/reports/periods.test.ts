import { describe, it, expect } from "vitest";
import { getPeriodRange, type Period } from "./periods";

describe("getPeriodRange", () => {
  const now = new Date("2026-05-15T10:30:00-05:00"); // viernes

  it("returns Monday 00:00 to Sunday 23:59 for 'week'", () => {
    const { start, end } = getPeriodRange("week", now);
    expect(start.getDay()).toBe(1); // lunes
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(end.getDay()).toBe(0); // domingo
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getTime() - start.getTime()).toBeGreaterThan(6 * 86400000);
  });

  it("returns first to last day of month for 'month'", () => {
    const { start, end } = getPeriodRange("month", now);
    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(4); // mayo (0-indexed)
    expect(end.getDate()).toBe(31);
    expect(end.getHours()).toBe(23);
  });

  it("returns Jan 1 to Dec 31 for 'year'", () => {
    const { start, end } = getPeriodRange("year", now);
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(11);
    expect(end.getDate()).toBe(31);
  });

  it("returns previous period for comparison", () => {
    const { start, end } = getPeriodRange("month", now);
    const { previousStart, previousEnd } = getPeriodRange("month", now);
    expect(previousEnd.getTime()).toBeLessThan(start.getTime());
    expect(previousStart.getMonth()).toBe(3); // abril
  });

  it("returns a human-readable label", () => {
    expect(getPeriodRange("week", now).label).toMatch(/semana/i);
    expect(getPeriodRange("month", now).label).toMatch(/mayo/i);
    expect(getPeriodRange("year", now).label).toMatch(/2026/);
  });
});
