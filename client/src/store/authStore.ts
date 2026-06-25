import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api'; // <-- Kept your custom config!

const API_URL = `${API_BASE_URL}/api/users`;

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // Action: Check if user is already logged in (Persist across restarts)
  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;

      // Verify the token by fetching the profile
      const response = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        set({ user: userData, token });
      } else {
        // If token is expired or invalid, clear it
        await SecureStore.deleteItemAsync('userToken');
        set({ user: null, token: null });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  },

  // Action: Log the user in
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      await SecureStore.setItemAsync('userToken', data.token);
      set({ user: data, token: data.token, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  // Action: Register a new user
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      await SecureStore.setItemAsync('userToken', data.token);
      set({ user: data, token: data.token, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  // Action: Log the user out
  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    set({ user: null, token: null });
  }
}));