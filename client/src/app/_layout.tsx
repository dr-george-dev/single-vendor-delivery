import { useEffect } from "react";
import { Stack } from "expo-router";
import "../global.css"; // Imports your Tailwind/NativeWind styles globally
import { useAuthStore } from "../store/authStore"; // <-- Import auth store

export default function RootLayout() {
  const checkAuth = useAuthStore((state: any) => state.checkAuth);

  // Fire the checkAuth function as soon as the app loads!
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    // The Stack component manages our screen transitions.
    // We set headerShown to false because we will build our own custom beautiful headers!
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* Set presentation to modal for the slide-up bottom sheet effect */}
      <Stack.Screen 
        name="product/[id]" 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen name="cart" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="success" />
    </Stack>
  );
}