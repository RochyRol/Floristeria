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
  RECEIVED: "Pedido recibido",
  PROCESSING: "Armando tu arreglo",
  READY: "Listo para entrega",
  IN_ROUTE: "En camino",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  RECEIVED: "#B8935A",
  PROCESSING: "#C97B63",
  READY: "#2D5241",
  IN_ROUTE: "#1F3A2E",
  DELIVERED: "#1F3A2E",
  CANCELLED: "#7A2E2E",
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
