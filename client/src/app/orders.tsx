import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/api';
import { Brand, ORDER_STATUS_META } from '../constants/brand';
import { IconButton } from '../components/ui/IconButton';
import { EmptyState } from '../components/ui/EmptyState';
import { PressableScale } from '../components/ui/PressableScale';

export default function OrdersScreen() {
  const router = useRouter();
  const { token } = useAuthStore((state: any) => state);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyOrders = async (isRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/orders/myorders`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch your orders');

      const data = await response.json();
      const sortedData = data.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyOrders();
    }, [token])
  );

  if (!token) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: Brand.bg }}>
        <Header onBack={() => router.back()} />
        <EmptyState
          icon="log-in"
          title="Sign in to see orders"
          subtitle="Your order history will show up here."
          actionLabel="Sign in"
          onAction={() => router.push('/login')}
        />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: Brand.bg }}>
        <ActivityIndicator size="large" color={Brand.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Brand.bg }} edges={['top']}>
      <Header onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMyOrders(true)}
            tintColor={Brand.accent}
          />
        }
        contentContainerStyle={{ paddingBottom: 28, paddingTop: 8 }}
      >
        {error ? (
          <EmptyState
            icon="wifi-off"
            title="Couldn't load orders"
            subtitle={error}
            actionLabel="Try again"
            onAction={() => fetchMyOrders()}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="package"
            title="No orders yet"
            subtitle="When you place an order, it will appear here with live status."
            actionLabel="Start ordering"
            onAction={() => router.push('/')}
          />
        ) : (
          orders.map((order: any) => {
            const status = order.status || 'Pending';
            const meta = ORDER_STATUS_META[status] || ORDER_STATUS_META.Pending;
            const itemCount = order.orderItems?.length || 0;
            const preview = order.orderItems?.[0];

            return (
              <PressableScale
                key={order._id}
                onPress={() => router.push(`/order/${order._id}`)}
                className="mb-3.5"
              >
                <View
                  className="bg-white p-4 rounded-[24px]"
                  style={{ borderWidth: 1, borderColor: Brand.border }}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="font-extrabold text-gray-900 text-[15px]">
                      #{String(order._id).slice(-6).toUpperCase()}
                    </Text>
                    <View
                      className="px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: meta.bg }}
                    >
                      <Text
                        className="text-[10px] font-extrabold uppercase tracking-wide"
                        style={{ color: meta.color }}
                      >
                        {meta.label}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    {preview?.image ? (
                      <View
                        className="rounded-xl p-1 mr-3"
                        style={{ backgroundColor: Brand.bg, borderWidth: 1, borderColor: Brand.border }}
                      >
                        <Image
                          source={{ uri: preview.image }}
                          className="w-12 h-12"
                          resizeMode="contain"
                        />
                      </View>
                    ) : (
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: Brand.bg }}
                      >
                        <Feather name="shopping-bag" size={18} color={Brand.muted} />
                      </View>
                    )}

                    <View className="flex-1">
                      <Text className="text-gray-500 font-medium text-sm mb-0.5">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        {preview?.name ? ` · ${preview.name}` : ''}
                      </Text>
                      <Text className="text-xs text-gray-400 font-medium">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="font-black text-lg text-gray-900">
                        ${Number(order.totalPrice || 0).toFixed(2)}
                      </Text>
                      <Feather name="chevron-right" size={16} color={Brand.mutedLight} />
                    </View>
                  </View>
                </View>
              </PressableScale>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View className="px-5 py-3 flex-row items-center">
      <IconButton name="chevron-left" onPress={onBack} />
      <Text className="text-lg font-black text-gray-900 ml-3">Order history</Text>
    </View>
  );
}
