import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { useAuthStore } from '../store/authStore';
import { Brand } from '../constants/brand';

export default function RootLayout() {
  const checkAuth = useAuthStore((state: any) => state.checkAuth);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await checkAuth();
      } catch (e) {
        // ignore
      }
      // no-op if component unmounted
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, [checkAuth]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Brand.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="product/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="cart" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="orders" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="kitchen/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="kitchen/menu/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="kitchen/menu/form" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="login" options={{ presentation: 'modal' }} />
        <Stack.Screen name="register" options={{ presentation: 'modal' }} />
        <Stack.Screen name="success" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}