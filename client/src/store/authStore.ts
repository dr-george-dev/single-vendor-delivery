import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/api';

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const isWeb = Platform.OS === 'web';
const authBaseUrl = `${API_BASE_URL}/api/users`;

// Helper to handle storage differences
const saveToken = async (key: string, value: string) => {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getToken = async (key: string) => {
  if (isWeb) {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteToken = async (key: string) => {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true });

    try {
      const token = await getToken('userToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const response = await fetch(`${authBaseUrl}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        await deleteToken('userToken');
        set({ token: null, user: null, isLoading: false });
        return;
      }

      const user = await response.json();
      set({ token, user, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error?.message || 'Session expired' });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${authBaseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      await saveToken('userToken', data.token);
      set({ token: data.token, user: data, isLoading: false });
      return true;
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Login failed' });
      return false;
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${authBaseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      await saveToken('userToken', data.token);
      set({ token: data.token, user: data, isLoading: false });
      return true;
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Registration failed' });
      return false;
    }
  },

  logout: async () => {
    await deleteToken('userToken');
    set({ token: null, user: null });
  }
}));