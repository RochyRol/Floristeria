import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "./cart";

const baseItem = {
  productId: "p1",
  name: "Rojo Eterno",
  slug: "rojo-eterno",
  image: "/img.jpg",
  size: "standard",
  sizeLabel: "Estándar",
  price: 180000,
  quantity: 1,
};

describe("cart store", () => {
  beforeEach(() => {
    // Reset store between tests
    useCartStore.setState({ items: [], isOpen: false });
  });

  describe("addItem", () => {
    it("adds a new item with composite id (productId-size)", () => {
      useCartStore.getState().addItem(baseItem);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe("p1-standard");
      expect(items[0].name).toBe("Rojo Eterno");
    });

    it("merges quantity when same product+size is added again", () => {
      const { addItem } = useCartStore.getState();
      addItem(baseItem);
      addItem({ ...baseItem, quantity: 2 });

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });

    it("creates separate entries for the same product in different sizes", () => {
      const { addItem } = useCartStore.getState();
      addItem(baseItem);
      addItem({ ...baseItem, size: "large", sizeLabel: "Grande" });

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(2);
      expect(items.map((i) => i.id)).toEqual(["p1-standard", "p1-large"]);
    });
  });

  describe("removeItem", () => {
    it("removes the item by id", () => {
      const { addItem, removeItem } = useCartStore.getState();
      addItem(baseItem);
      addItem({ ...baseItem, productId: "p2", name: "Pasión" });

      removeItem("p1-standard");
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe("p2");
    });

    it("is a no-op when id is not in cart", () => {
      const { addItem, removeItem } = useCartStore.getState();
      addItem(baseItem);
      removeItem("does-not-exist");
      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("updates the quantity of an existing item", () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      addItem(baseItem);
      updateQuantity("p1-standard", 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it("removes the item when quantity drops to 0", () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      addItem(baseItem);
      updateQuantity("p1-standard", 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("removes the item when quantity goes negative", () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      addItem(baseItem);
      updateQuantity("p1-standard", -1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("updateDedication", () => {
    it("attaches a dedication message to an item", () => {
      const { addItem, updateDedication } = useCartStore.getState();
      addItem(baseItem);
      updateDedication("p1-standard", "Feliz aniversario, mi amor");

      const item = useCartStore.getState().items[0];
      expect(item.dedication).toBe("Feliz aniversario, mi amor");
    });
  });

  describe("clearCart", () => {
    it("empties the cart", () => {
      const { addItem, clearCart } = useCartStore.getState();
      addItem(baseItem);
      addItem({ ...baseItem, productId: "p2" });

      clearCart();
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("setOpen", () => {
    it("toggles the drawer open state", () => {
      const { setOpen } = useCartStore.getState();
      setOpen(true);
      expect(useCartStore.getState().isOpen).toBe(true);
      setOpen(false);
      expect(useCartStore.getState().isOpen).toBe(false);
    });
  });

  describe("computed getters", () => {
    it("subtotal returns 0 for an empty cart", () => {
      expect(useCartStore.getState().subtotal()).toBe(0);
    });

    it("subtotal sums price * quantity across items", () => {
      const { addItem } = useCartStore.getState();
      addItem(baseItem); // 180000 × 1
      addItem({ ...baseItem, productId: "p2", price: 50000, quantity: 2 }); // 50000 × 2

      expect(useCartStore.getState().subtotal()).toBe(180000 + 100000);
    });

    it("total mirrors subtotal (no shipping/discount applied at store level)", () => {
      const { addItem, subtotal, total } = useCartStore.getState();
      addItem({ ...baseItem, price: 75000, quantity: 3 });

      const state = useCartStore.getState();
      expect(state.total()).toBe(state.subtotal());
      expect(total()).toBe(subtotal());
    });

    it("itemCount sums quantities across all items", () => {
      const { addItem } = useCartStore.getState();
      addItem({ ...baseItem, quantity: 2 });
      addItem({ ...baseItem, productId: "p2", quantity: 3 });

      expect(useCartStore.getState().itemCount()).toBe(5);
    });

    it("itemCount counts merged quantities correctly", () => {
      const { addItem } = useCartStore.getState();
      addItem(baseItem); // qty 1
      addItem({ ...baseItem, quantity: 4 }); // merged → qty 5

      expect(useCartStore.getState().itemCount()).toBe(5);
    });
  });

  describe("integration", () => {
    it("full lifecycle: add → update → remove → clear", () => {
      const store = useCartStore.getState();

      store.addItem(baseItem);
      store.addItem({ ...baseItem, productId: "p2", price: 100000 });
      expect(useCartStore.getState().items).toHaveLength(2);

      store.updateQuantity("p1-standard", 3);
      expect(useCartStore.getState().subtotal()).toBe(180000 * 3 + 100000);

      store.removeItem("p2-standard");
      expect(useCartStore.getState().items).toHaveLength(1);

      store.clearCart();
      expect(useCartStore.getState().items).toHaveLength(0);
      expect(useCartStore.getState().subtotal()).toBe(0);
    });
  });
});
