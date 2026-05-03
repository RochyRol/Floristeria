import { Metadata } from "next";
import { CartPageClient } from "@/components/cart/cart-page-client";

export const metadata: Metadata = {
  title: "Mi Carrito",
};

export default function CartPage() {
  return <CartPageClient />;
}
