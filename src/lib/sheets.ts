/**
 * Google Sheets sync — POSTs JSON payloads to an Apps Script Web App.
 * The script lives at apps-script/sheet-sync.gs in this repo.
 */

const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL ?? "";
const SECRET = process.env.SHEETS_SYNC_SECRET ?? "";

type SyncType = "full-sync" | "order-created";

export function isSheetsConfigured(): boolean {
  return !!WEBHOOK_URL && !!SECRET;
}

/**
 * Sends a payload to the Apps Script. Never throws — logs errors and returns false
 * so a failed sync doesn't break order creation.
 */
export async function sendToSheets(
  type: SyncType,
  data: unknown,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSheetsConfigured()) {
    return { ok: false, error: "Sheets not configured (set GOOGLE_SHEETS_WEBHOOK_URL and SHEETS_SYNC_SECRET)" };
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: SECRET, type, data }),
      // Apps Script web apps redirect — follow it
      redirect: "follow",
    });

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/**
 * Maps email → seed password (only for the demo accounts the seed creates).
 * Real users registered through /registro have only their bcrypt hash.
 */
export const SEED_PASSWORDS: Record<string, string> = {
  "admin@decoimperio.com": "admin123",
  "vendedor@decoimperio.com": "vendedor123",
  "florista@decoimperio.com": "florista123",
  "cliente@test.com": "cliente123",
};
