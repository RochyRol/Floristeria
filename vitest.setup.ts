import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

// Reset localStorage between tests so Zustand persist doesn't bleed.
beforeEach(() => {
  if (typeof localStorage !== "undefined") localStorage.clear();
});
