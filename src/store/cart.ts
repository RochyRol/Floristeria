import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  sizeLabel: string;
  price: number;
  quantity: number;
  dedication?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateDedication: (id: string, dedication: string) => void;
  clearCart: () => void;
  setOpen: (open: boolean) => void;
  total: () => number;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const id = `${item.productId}-${item.size}`;
        const existing = get().items.find((i) => i.id === id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, { ...item, id }] }));
        }
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      updateDedication: (id, dedication) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, dedication } : i)),
        })),

      clearCart: () => set({ items: [] }),

      setOpen: (open) => set({ isOpen: open }),

      subtotal: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),

      total: () => get().subtotal(),

      itemCount: () =>
        get().items.reduce((acc, item) => acc + item.quantity, 0),
    }),
    {
      name: "decoimperio-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
