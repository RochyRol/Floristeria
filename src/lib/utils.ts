import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateOrderNumber(): string {
  const date = new Date();
  const prefix = "DI";
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `${prefix}${year}${month}${day}-${random}`;
}

export function getWhatsAppUrl(message?: string): string {
  const phone = "573215039845";
  const defaultMsg = "Hola, me interesa un arreglo floral.";
  const encodedMsg = encodeURIComponent(message || defaultMsg);
  return `https://wa.me/${phone}?text=${encodedMsg}`;
}

export function getProductWhatsAppUrl(productName: string, price: number): string {
  const msg = `Hola, estoy interesad@ en el arreglo "${productName}" (${formatCOP(price)}). ¿Está disponible?`;
  return getWhatsAppUrl(msg);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  RECEIVED:  "Pedido recibido",
  ACCEPTED:  "Pedido aceptado",
  MAKING:    "Elaborándose",
  READY:     "Listo",
  IN_ROUTE:  "En camino",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  RECEIVED:  "#A87C3A",
  ACCEPTED:  "#1C3A2B",
  MAKING:    "#7A3D4C",
  READY:     "#1C3A2B",
  IN_ROUTE:  "#A87C3A",
  DELIVERED: "#1C3A2B",
  CANCELLED: "#7A2E2E",
};

// The 5 visible phases for the progress bar (CANCELLED handled separately)
export const ORDER_PHASES = [
  { status: "RECEIVED",  label: "Recibido",   icon: "📥" },
  { status: "ACCEPTED",  label: "Aceptado",   icon: "✅" },
  { status: "MAKING",    label: "Elaborando", icon: "🌸" },
  { status: "READY",     label: "Listo",      icon: "📦" },
  { status: "IN_ROUTE",  label: "En camino",  icon: "🛵" },
] as const;

// Maps current status → next status (for admin one-click advance)
export const NEXT_ORDER_STATUS: Record<string, string> = {
  RECEIVED: "ACCEPTED",
  ACCEPTED: "MAKING",
  MAKING:   "READY",
  READY:    "IN_ROUTE",
  IN_ROUTE: "DELIVERED",
};

export const NEXT_STATUS_LABEL: Record<string, string> = {
  RECEIVED: "Aceptar pedido",
  ACCEPTED: "Iniciar elaboración",
  MAKING:   "Marcar como listo",
  READY:    "Despachar",
  IN_ROUTE: "Confirmar entrega",
};

export const SHIPPING_COSTS: Record<string, number> = {
  "Medellín Norte": 8000,
  "Bello": 8000,
  "Niquía": 8000,
  "Copacabana": 12000,
  "Medellín Centro": 10000,
  "Medellín Sur": 12000,
  "Sabaneta": 15000,
  "Otro": 15000,
};
