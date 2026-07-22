import { create } from "zustand";
import { API_BASE_URL } from "../config/api";

export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered";

export type Order = {
  _id: string;
  status: OrderStatus;
  totalPrice: number;
  subtotal?: number;
  deliveryFee?: number;
  deliveryAddress?: string;
  paymentMethod?: string;
  isPaid?: boolean;
  estimatedTime?: string;
  createdAt?: string;
  note?: string;
  user?: { _id?: string; name?: string; email?: string };
  orderItems?: Array<{
    name: string;
    qty: number;
    image?: string;
    price: number;
    product?: string;
  }>;
};

type KitchenState = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchOrders: (token: string, silent?: boolean) => Promise<void>;
  advanceOrderStatus: (
    orderId: string,
    currentStatus: string,
    token: string,
  ) => Promise<void>;
  setOrderStatus: (
    orderId: string,
    status: string,
    token: string,
  ) => Promise<void>;
  // Call this when a WebSocket / realtime listener fires
  injectRealtimeOrder: (newOrder: Order) => void;
};

const NEXT_STATUS: Record<string, OrderStatus | null> = {
  Pending: "Preparing",
  Preparing: "Out for Delivery",
  "Out for Delivery": "Delivered",
  Delivered: null,
};

export const useKitchenStore = create<KitchenState>((set, get) => ({
  orders: [],
  loading: true,
  error: null,
  lastUpdated: null,

  fetchOrders: async (token, silent = false) => {
    if (!silent) set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 403) {
        throw new Error("Kitchen access only — sign in with an admin account.");
      }
      if (!response.ok) throw new Error("Could not load kitchen orders");
      const data = await response.json();
      set({
        orders: data,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  advanceOrderStatus: async (orderId, currentStatus, token) => {
    const targetStatus = NEXT_STATUS[currentStatus];
    if (!targetStatus) return;

    const previousOrders = get().orders;
    set({
      orders: previousOrders.map((o) =>
        o._id === orderId ? { ...o, status: targetStatus } : o,
      ),
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ advance: true }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Update failed");
      }

      const updated = await response.json();
      set({
        orders: get().orders.map((o) => (o._id === orderId ? updated : o)),
      });
    } catch (err) {
      set({ orders: previousOrders });
      console.error("Failed to advance order, rolled back:", err);
    }
  },

  setOrderStatus: async (orderId, status, token) => {
    const previousOrders = get().orders;
    set({
      orders: previousOrders.map((o) =>
        o._id === orderId ? { ...o, status: status as OrderStatus } : o,
      ),
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Update failed");
      }

      const updated = await response.json();
      set({
        orders: get().orders.map((o) => (o._id === orderId ? updated : o)),
      });
    } catch (err) {
      set({ orders: previousOrders });
      console.error("Failed to set order status, rolled back:", err);
    }
  },

  injectRealtimeOrder: (newOrder) => {
    set((state) => ({
      orders: [newOrder, ...state.orders.filter((o) => o._id !== newOrder._id)],
    }));
  },
}));
