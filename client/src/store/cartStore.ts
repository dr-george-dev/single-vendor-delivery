import { create } from 'zustand';

type CartProduct = {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image: string;
  qty?: number;
  [key: string]: any;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  [key: string]: any;
};

type CartState = {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addItem: (product, quantity = 1) => {
    const productId = product._id ?? product.id;
    if (!productId) return;

    const currentItems = get().items;
    const existingItem = currentItems.find((item) => item.id === productId);

    if (existingItem) {
      set({
        items: currentItems.map((item) =>
          item.id === productId
            ? { ...item, qty: item.qty + quantity }
            : item
        ),
      });
    } else {
      set({
        items: [
          ...currentItems,
          { ...product, qty: quantity, id: productId } as CartItem,
        ],
      });
    }
  },

  // Action 2: Remove an item completely
  removeItem: (productId: string) => {
    set({ items: get().items.filter((item) => item.id !== productId) });
  },

  // Action 3: Clear the entire cart (used after a successful checkout!)
  clearCart: () => set({ items: [] }),

  // Helper function to calculate the total price of everything in the cart
  getSubtotal: () => {
    return get().items.reduce((total, item) => total + (item.price * item.qty), 0);
  }
}));