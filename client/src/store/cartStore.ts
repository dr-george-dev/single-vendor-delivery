import { create } from 'zustand';

// Define the shape of our global state
export const useCartStore = create((set, get) => ({
  // The array that holds all selected items
  items: [],
  
  // Action 1: Add an item to the cart
  addItem: (product, quantity = 1) => {
    const currentItems = get().items;
    const existingItem = currentItems.find(item => item.id === product.id);

    if (existingItem) {
      // If item already exists, just update the quantity
      set({
        items: currentItems.map(item => 
          item.id === product.id 
            ? { ...item, qty: item.qty + quantity }
            : item
        )
      });
    } else {
      // If it's a new item, add it to the array
      set({ items: [...currentItems, { ...product, qty: quantity }] });
    }
  },

  // Action 2: Remove an item completely
  removeItem: (productId) => {
    set({ items: get().items.filter(item => item.id !== productId) });
  },

  // Action 3: Clear the entire cart (used after a successful checkout!)
  clearCart: () => set({ items: [] }),

  // Helper function to calculate the total price of everything in the cart
  getSubtotal: () => {
    return get().items.reduce((total, item) => total + (item.price * item.qty), 0);
  }
}));