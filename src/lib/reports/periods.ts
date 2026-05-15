export type Period = "week" | "month" | "year";

export interface PeriodRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
  label: string;
}

export function getPeriodRange(period: Period, reference: Date = new Date()): PeriodRange {
  const ref = new Date(reference);

  if (period === "week") {
    const day = ref.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    const start = new Date(ref);
    start.setDate(ref.getDate() - daysFromMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const previousStart = new Date(start);
    previousStart.setDate(start.getDate() - 7);
    const previousEnd = new Date(end);
    previousEnd.setDate(end.getDate() - 7);
    const fmt = (d: Date) =>
      d.toLocaleDateString("es-CO", { day: "numeric", month: "long" });
    return {
      start,
      end,
      previousStart,
      previousEnd,
      label: `Semana del ${fmt(start)} al ${fmt(end)}, ${start.getFullYear()}`,
    };
  }

  if (period === "month") {
    const start = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
    const previousStart = new Date(ref.getFullYear(), ref.getMonth() - 1, 1, 0, 0, 0, 0);
    const previousEnd = new Date(ref.getFullYear(), ref.getMonth(), 0, 23, 59, 59, 999);
    const monthName = start.toLocaleDateString("es-CO", { month: "long" });
    return {
      start,
      end,
      previousStart,
      previousEnd,
      label: `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${start.getFullYear()}`,
    };
  }

  // year
  const start = new Date(ref.getFullYear(), 0, 1, 0, 0, 0, 0);
  const end = new Date(ref.getFullYear(), 11, 31, 23, 59, 59, 999);
  const previousStart = new Date(ref.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
  const previousEnd = new Date(ref.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  return {
    start,
    end,
    previousStart,
    previousEnd,
    label: `Año ${start.getFullYear()}`,
  };
}
