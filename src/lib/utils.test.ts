import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cn,
  formatCOP,
  slugify,
  generateOrderNumber,
  getWhatsAppUrl,
  getProductWhatsAppUrl,
  formatDate,
  formatDateTime,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  SHIPPING_COSTS,
} from "./utils";

describe("cn (classname merger)", () => {
  it("merges plain classes", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("dedupes conflicting tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles falsy values gracefully", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("supports conditional objects", () => {
    expect(cn({ active: true, hidden: false })).toBe("active");
  });
});

describe("formatCOP", () => {
  it("formats integer to Colombian peso currency", () => {
    const result = formatCOP(180000);
    expect(result).toMatch(/180\.000/);
    expect(result).toMatch(/\$/);
  });

  it("formats zero correctly", () => {
    expect(formatCOP(0)).toMatch(/0/);
  });

  it("rounds decimals (no fraction digits)", () => {
    const result = formatCOP(1500.99);
    expect(result).not.toContain(",99");
    expect(result).not.toContain(".99");
  });

  it("handles large amounts (millions)", () => {
    const result = formatCOP(2500000);
    expect(result).toMatch(/2\.500\.000/);
  });
});

describe("slugify", () => {
  it("converts to lowercase and replaces spaces with hyphens", () => {
    expect(slugify("Rojo Eterno")).toBe("rojo-eterno");
  });

  it("removes accents", () => {
    expect(slugify("Pasión de Medianoche")).toBe("pasion-de-medianoche");
  });

  it("removes special characters", () => {
    expect(slugify("Amor & Romance!")).toBe("amor-romance");
  });

  it("collapses multiple spaces and hyphens", () => {
    expect(slugify("Bouquet   Imperial")).toBe("bouquet-imperial");
  });

  it("handles tildes (ñ becomes n)", () => {
    expect(slugify("Cumpleaños")).toBe("cumpleanos");
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });
});

describe("generateOrderNumber", () => {
  beforeEach(() => {
    // Freeze time so the date prefix is deterministic
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-03T10:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses DI prefix + YYMMDD format", () => {
    const order = generateOrderNumber();
    expect(order).toMatch(/^DI260503-\d{4}$/);
  });

  it("pads single-digit month and day with zero", () => {
    vi.setSystemTime(new Date("2026-01-05T10:00:00"));
    expect(generateOrderNumber()).toMatch(/^DI260105-\d{4}$/);
  });

  it("generates 4-digit random suffix", () => {
    const order = generateOrderNumber();
    const suffix = order.split("-")[1];
    expect(suffix).toHaveLength(4);
    expect(Number(suffix)).toBeGreaterThanOrEqual(0);
    expect(Number(suffix)).toBeLessThanOrEqual(9999);
  });

  it("produces different numbers across calls (statistically)", () => {
    const numbers = new Set(
      Array.from({ length: 50 }, () => generateOrderNumber()),
    );
    // Some collision possible with 4-digit random — should be very rare in 50 calls
    expect(numbers.size).toBeGreaterThan(40);
  });
});

describe("getWhatsAppUrl", () => {
  it("uses the default message when none provided", () => {
    const url = getWhatsAppUrl();
    expect(url).toContain("https://wa.me/573215039845");
    expect(url).toContain(encodeURIComponent("Hola, me interesa un arreglo floral."));
  });

  it("encodes custom messages safely", () => {
    const url = getWhatsAppUrl("Hola ¿está disponible?");
    expect(url).toContain("https://wa.me/573215039845");
    expect(url).toContain(encodeURIComponent("Hola ¿está disponible?"));
  });

  it("encodes special URL characters", () => {
    const url = getWhatsAppUrl("a&b c");
    expect(url).toContain("a%26b%20c");
  });
});

describe("getProductWhatsAppUrl", () => {
  it("includes product name and formatted price", () => {
    const url = getProductWhatsAppUrl("Rojo Eterno", 180000);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("Rojo Eterno");
    expect(decoded).toMatch(/180\.000/);
  });

  it("uses the WhatsApp number from getWhatsAppUrl", () => {
    const url = getProductWhatsAppUrl("Test", 50000);
    expect(url).toContain("https://wa.me/573215039845");
  });
});

describe("formatDate", () => {
  it("formats Date object in Colombian Spanish", () => {
    const result = formatDate(new Date("2026-05-03"));
    expect(result.toLowerCase()).toContain("mayo");
    expect(result).toContain("2026");
  });

  it("accepts ISO string", () => {
    const result = formatDate("2026-12-25");
    expect(result.toLowerCase()).toContain("diciembre");
  });
});

describe("formatDateTime", () => {
  it("includes hour and minute", () => {
    const result = formatDateTime(new Date("2026-05-03T15:30:00"));
    expect(result).toMatch(/\d{1,2}:\d{2}/);
    expect(result.toLowerCase()).toContain("mayo");
  });
});

describe("constants", () => {
  it("ORDER_STATUS_LABELS has all 6 statuses", () => {
    expect(Object.keys(ORDER_STATUS_LABELS)).toEqual([
      "RECEIVED",
      "PROCESSING",
      "READY",
      "IN_ROUTE",
      "DELIVERED",
      "CANCELLED",
    ]);
  });

  it("ORDER_STATUS_COLORS uses hex format", () => {
    Object.values(ORDER_STATUS_COLORS).forEach((color) => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it("SHIPPING_COSTS includes Bello (the shop's home zone)", () => {
    expect(SHIPPING_COSTS["Bello"]).toBeGreaterThan(0);
    expect(SHIPPING_COSTS["Bello"]).toBe(8000);
  });

  it("SHIPPING_COSTS has positive numbers for every zone", () => {
    Object.values(SHIPPING_COSTS).forEach((cost) => {
      expect(cost).toBeGreaterThan(0);
      expect(Number.isInteger(cost)).toBe(true);
    });
  });
});
