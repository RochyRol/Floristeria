import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { FloatingPetals } from "@/components/ui/floating-petals";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FloatingPetals count={22} />
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer />
    </>
  );
}
