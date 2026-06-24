import { Stack } from "expo-router";
import "../global.css"; // Imports your Tailwind/NativeWind styles globally

export default function RootLayout() {
  return (
    // The Stack component manages our screen transitions.
    // We set headerShown to false because we will build our own custom beautiful headers!
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="success" />
    </Stack>
  );
}