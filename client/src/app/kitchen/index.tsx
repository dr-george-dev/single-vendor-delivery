import { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useKitchenStore } from '../../store/kitchenStore';
import { Brand } from '../../constants/brand';
import { OrderCard } from '../../components/kitchen/OrderCard';
import { EmptyState } from '../../components/ui/EmptyState';

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'Pending', label: 'New' },
  { key: 'Preparing', label: 'Cooking' },
  { key: 'Out for Delivery', label: 'Delivery' },
] as const;

export default function KitchenBoardScreen() {
  const router = useRouter();
  const { token, user } = useAuthStore((s: any) => s);
  
  const { orders, loading, error, fetchOrders } = useKitchenStore();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('active');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (token && isAdmin) {
      fetchOrders(token);
      
      // TODO: Initialize WebSocket/Realtime listener here instead of polling
      // socket.on('order_created', (order) => useKitchenStore.getState().injectRealtimeOrder(order))
    }
  }, [token, isAdmin]);

  if (!user || !isAdmin) return <ActivityIndicator color={Brand.accent} />;

  const filteredOrders = orders.filter((o) => 
    tab === 'active' ? o.status !== 'Delivered' : o.status === tab
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Brand.bg }} edges={['top']}>
      {/* Header & Tabs UI (Paste your existing clean UI here) */}
      
      <ScrollView
        className="flex-1 px-5 mt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => fetchOrders(token, false)}
            tintColor={Brand.accent}
          />
        }
      >
        {filteredOrders.length === 0 ? (
          <EmptyState title="No active orders" icon="coffee" />
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} token={token} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}