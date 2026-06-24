import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// 🚨 REMEMBER: Replace with your actual computer's Wi-Fi IPv4 address!
const API_URL = "http://192.168.1.9:5000/api/users";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

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

  // Action: Register a new user (THIS WAS MISSING!)
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