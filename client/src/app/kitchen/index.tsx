import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { API_BASE_URL } from '../../config/api';
import { Brand, ORDER_STATUS_META } from '../../constants/brand';
import { IconButton } from '../../components/ui/IconButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { PressableScale } from '../../components/ui/PressableScale';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

type Order = {
  _id: string;
  status: string;
  totalPrice: number;
  subtotal: number;
  deliveryFee: number;
  deliveryAddress: string;
  paymentMethod: string;
  isPaid: boolean;
  estimatedTime?: string;
  createdAt: string;
  orderItems: Array<{
    name: string;
    qty: number;
    price: number;
    image?: string;
  }>;
  user?: { name?: string; email?: string };
};

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'Pending', label: 'New' },
  { key: 'Preparing', label: 'Cooking' },
  { key: 'Out for Delivery', label: 'Delivery' },
  { key: 'Delivered', label: 'Done' },
] as const;

const NEXT_LABEL: Record<string, string> = {
  Pending: 'Start preparing',
  Preparing: 'Out for delivery',
  'Out for Delivery': 'Mark delivered',
};

const POLL_MS = 12000;

export default function KitchenBoardScreen() {
  const router = useRouter();
  const { token, user } = useAuthStore((s: any) => s);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // For "new order" alerts — compare IDs between polls
  const knownIdsRef = useRef<Set<string> | null>(null);
  const isFirstLoad = useRef(true);

  const isAdmin = user?.role === 'admin';

  const fetchOrders = useCallback(
    async (opts?: { silent?: boolean; pull?: boolean }) => {
      if (!token) return;

      try {
        if (opts?.pull) setRefreshing(true);
        else if (!opts?.silent) setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          throw new Error('Kitchen access only — sign in with an admin account.');
        }
        if (!response.ok) throw new Error('Could not load kitchen orders');

        const data: Order[] = await response.json();

        // Detect brand-new orders after first successful load
        const ids = new Set(data.map((o) => o._id));
        if (knownIdsRef.current && !isFirstLoad.current) {
          const newcomers = data.filter((o) => !knownIdsRef.current!.has(o._id));
          if (newcomers.length > 0) {
            const newest = newcomers[0];
            Alert.alert(
              newcomers.length === 1 ? '🔔 New order!' : `🔔 ${newcomers.length} new orders!`,
              newcomers.length === 1
                ? `#${newest._id.slice(-6).toUpperCase()} · $${Number(newest.totalPrice).toFixed(2)}\n${newest.deliveryAddress}`
                : 'Check the Active tab for new tickets.',
              [{ text: 'OK' }]
            );
            setTab('Pending');
          }
        }
        knownIdsRef.current = ids;
        isFirstLoad.current = false;

        setOrders(data);
        setLastUpdated(new Date());
      } catch (err: any) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  // Auth + role gate
  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'admin') {
      Alert.alert(
        'Kitchen only',
        'This board is for kitchen staff. Sign in with an admin account.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    }
  }, [user, router]);

  // Initial load + polling
  useEffect(() => {
    if (!token || !isAdmin) return;

    fetchOrders();
    const interval = setInterval(() => fetchOrders({ silent: true }), POLL_MS);
    return () => clearInterval(interval);
  }, [token, isAdmin, fetchOrders]);

  const advanceStatus = async (order: Order) => {
    if (order.status === 'Delivered') return;

    setUpdatingId(order._id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${order._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ advance: true }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Update failed');

      setOrders((prev) => prev.map((o) => (o._id === order._id ? data : o)));
    } catch (err: any) {
      Alert.alert('Update failed', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const setStatus = async (order: Order, status: string) => {
    setUpdatingId(order._id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${order._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Update failed');

      setOrders((prev) => prev.map((o) => (o._id === order._id ? data : o)));
    } catch (err: any) {
      Alert.alert('Update failed', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (tab === 'active') return o.status !== 'Delivered';
    return o.status === tab;
  });

  const counts = {
    active: orders.filter((o) => o.status !== 'Delivered').length,
    Pending: orders.filter((o) => o.status === 'Pending').length,
    Preparing: orders.filter((o) => o.status === 'Preparing').length,
    'Out for Delivery': orders.filter((o) => o.status === 'Out for Delivery').length,
    Delivered: orders.filter((o) => o.status === 'Delivered').length,
  };

  if (!user || !isAdmin) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: Brand.bg }}>
        <ActivityIndicator color={Brand.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Brand.bg }} edges={['top']}>
      {/* Header */}
      <View className="px-5 py-3 flex-row items-center justify-between">
        <IconButton name="chevron-left" onPress={() => router.back()} />
        <View className="items-center flex-1 px-3">
          <Text className="text-lg font-black text-gray-900">Kitchen board</Text>
          <Text className="text-[11px] font-medium" style={{ color: Brand.mutedLight }}>
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · auto-refresh`
              : 'Loading…'}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <IconButton name="book-open" onPress={() => router.push('/kitchen/menu')} />
          <IconButton name="refresh-cw" onPress={() => fetchOrders({ pull: true })} />
        </View>
      </View>

      {/* Quick link to menu manager */}
      <PressableScale onPress={() => router.push('/kitchen/menu')} className="mx-5 mb-2">
        <View
          className="flex-row items-center px-4 py-3 rounded-2xl"
          style={{ backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.border }}
        >
          <Feather name="book-open" size={16} color={Brand.accent} />
          <Text className="ml-2 font-bold text-sm text-gray-800 flex-1">Manage menu</Text>
          <Text className="text-xs font-medium mr-1" style={{ color: Brand.mutedLight }}>
            prices · sold out
          </Text>
          <Feather name="chevron-right" size={16} color={Brand.mutedLight} />
        </View>
      </PressableScale>

      {/* Status tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          const count = counts[t.key as keyof typeof counts] ?? 0;
          return (
            <PressableScale key={t.key} onPress={() => setTab(t.key)} scaleTo={0.96}>
              <View
                className="flex-row items-center px-4 py-2.5 rounded-full"
                style={{
                  backgroundColor: active ? Brand.ink : Brand.surface,
                  borderWidth: 1,
                  borderColor: active ? Brand.ink : Brand.border,
                }}
              >
                <Text
                  className="font-extrabold text-sm"
                  style={{ color: active ? '#fff' : Brand.ink }}
                >
                  {t.label}
                </Text>
                <View
                  className="ml-2 min-w-[22px] h-[22px] rounded-full items-center justify-center px-1.5"
                  style={{ backgroundColor: active ? 'rgba(255,255,255,0.2)' : Brand.bg }}
                >
                  <Text
                    className="text-[11px] font-black"
                    style={{ color: active ? '#fff' : Brand.muted }}
                  >
                    {count}
                  </Text>
                </View>
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>

      {/* New-order banner when Pending exists */}
      {counts.Pending > 0 && tab !== 'Pending' && (
        <PressableScale onPress={() => setTab('Pending')} className="mx-5 mb-3">
          <View
            className="flex-row items-center px-4 py-3 rounded-2xl"
            style={{ backgroundColor: Brand.warningSoft, borderWidth: 1, borderColor: '#FDE68A' }}
          >
            <Feather name="bell" size={16} color="#B45309" />
            <Text className="ml-2 font-bold text-sm text-amber-800 flex-1">
              {counts.Pending} new order{counts.Pending === 1 ? '' : 's'} waiting
            </Text>
            <Feather name="chevron-right" size={16} color="#B45309" />
          </View>
        </PressableScale>
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Brand.accent} />
          <Text className="text-gray-400 mt-3 font-medium">Loading tickets…</Text>
        </View>
      ) : error ? (
        <EmptyState
          icon="wifi-off"
          title="Board offline"
          subtitle={error}
          actionLabel="Retry"
          onAction={() => fetchOrders()}
        />
      ) : (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOrders({ pull: true })}
              tintColor={Brand.accent}
            />
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon="coffee"
              title={tab === 'active' ? 'No active orders' : 'Nothing here'}
              subtitle={
                tab === 'Pending'
                  ? 'New customer orders will show up here automatically.'
                  : 'Pull down to refresh, or wait for auto-refresh.'
              }
            />
          ) : (
            filtered.map((order) => {
              const meta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.Pending;
              const expanded = expandedId === order._id;
              const busy = updatingId === order._id;
              const shortId = order._id.slice(-6).toUpperCase();
              const itemCount = order.orderItems?.reduce((n, i) => n + i.qty, 0) || 0;
              const ageMin = Math.max(
                0,
                Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
              );

              return (
                <View
                  key={order._id}
                  className="bg-white rounded-[24px] mb-3.5 overflow-hidden"
                  style={{
                    borderWidth: 1.5,
                    borderColor:
                      order.status === 'Pending' ? Brand.accent : Brand.border,
                  }}
                >
                  <PressableScale
                    onPress={() => setExpandedId(expanded ? null : order._id)}
                    scaleTo={0.99}
                  >
                    <View className="p-4">
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 mr-3">
                          <Text className="text-xs font-semibold text-gray-400 mb-0.5">
                            #{shortId} · {ageMin}m ago
                          </Text>
                          <Text className="text-base font-black text-gray-900">
                            {order.user?.name || 'Customer'}
                          </Text>
                          <Text className="text-sm text-gray-500 font-medium mt-0.5" numberOfLines={1}>
                            {order.deliveryAddress}
                          </Text>
                        </View>
                        <View
                          className="px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: meta.bg }}
                        >
                          <Text
                            className="text-[10px] font-extrabold uppercase"
                            style={{ color: meta.color }}
                          >
                            {meta.label}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm text-gray-500 font-medium">
                          {itemCount} item{itemCount === 1 ? '' : 's'} · {order.paymentMethod}
                          {order.isPaid ? ' · Paid' : ' · Unpaid'}
                        </Text>
                        <Text className="font-black text-base text-gray-900">
                          ${Number(order.totalPrice).toFixed(2)}
                        </Text>
                      </View>

                      {/* Item preview chips */}
                      <View className="flex-row flex-wrap mt-2.5 gap-1.5">
                        {(order.orderItems || []).slice(0, 4).map((item, idx) => (
                          <View
                            key={`${order._id}-${idx}`}
                            className="px-2 py-1 rounded-lg"
                            style={{ backgroundColor: Brand.bg }}
                          >
                            <Text className="text-[11px] font-bold text-gray-700">
                              {item.qty}× {item.name}
                            </Text>
                          </View>
                        ))}
                        {(order.orderItems?.length || 0) > 4 && (
                          <View className="px-2 py-1 rounded-lg" style={{ backgroundColor: Brand.bg }}>
                            <Text className="text-[11px] font-bold text-gray-500">
                              +{order.orderItems.length - 4} more
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </PressableScale>

                  {/* Expanded ticket */}
                  {expanded && (
                    <View className="px-4 pb-4 border-t border-gray-100 pt-3">
                      {(order.orderItems || []).map((item, idx) => (
                        <View key={`full-${idx}`} className="flex-row items-center mb-2.5">
                          {item.image ? (
                            <Image
                              source={{ uri: item.image }}
                              className="w-10 h-10 rounded-lg mr-3"
                              resizeMode="contain"
                            />
                          ) : (
                            <View
                              className="w-10 h-10 rounded-lg mr-3 items-center justify-center"
                              style={{ backgroundColor: Brand.bg }}
                            >
                              <Feather name="box" size={16} color={Brand.muted} />
                            </View>
                          )}
                          <View className="flex-1">
                            <Text className="font-bold text-sm text-gray-900">{item.name}</Text>
                            <Text className="text-xs text-gray-400">Qty {item.qty}</Text>
                          </View>
                          <Text className="font-bold text-sm text-gray-800">
                            ${(item.price * item.qty).toFixed(2)}
                          </Text>
                        </View>
                      ))}

                      <View className="h-px bg-gray-100 my-2" />
                      <Text className="text-xs text-gray-400 font-medium mb-1">Customer</Text>
                      <Text className="text-sm font-bold text-gray-800 mb-3">
                        {order.user?.name} · {order.user?.email}
                      </Text>

                      {/* Primary advance */}
                      {order.status !== 'Delivered' && (
                        <PrimaryButton
                          label={NEXT_LABEL[order.status] || 'Advance'}
                          onPress={() => advanceStatus(order)}
                          loading={busy}
                          className="mb-2"
                        />
                      )}

                      {/* Manual status jumps (corrections) */}
                      {order.status !== 'Delivered' && (
                        <View className="flex-row flex-wrap gap-2 mt-1">
                          {(['Pending', 'Preparing', 'Out for Delivery', 'Delivered'] as const)
                            .filter((s) => s !== order.status)
                            .map((s) => (
                              <PressableScale
                                key={s}
                                onPress={() => setStatus(order, s)}
                                disabled={busy}
                                scaleTo={0.96}
                              >
                                <View
                                  className="px-3 py-2 rounded-full"
                                  style={{
                                    backgroundColor: ORDER_STATUS_META[s].bg,
                                    borderWidth: 1,
                                    borderColor: Brand.border,
                                    opacity: busy ? 0.5 : 1,
                                  }}
                                >
                                  <Text
                                    className="text-[11px] font-extrabold"
                                    style={{ color: ORDER_STATUS_META[s].color }}
                                  >
                                    → {ORDER_STATUS_META[s].label}
                                  </Text>
                                </View>
                              </PressableScale>
                            ))}
                        </View>
                      )}

                      {order.status === 'Delivered' && (
                        <View
                          className="flex-row items-center justify-center py-3 rounded-2xl"
                          style={{ backgroundColor: Brand.successSoft }}
                        >
                          <Feather name="check-circle" size={16} color={Brand.success} />
                          <Text className="ml-2 font-bold text-emerald-700">Completed</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Collapsed quick action */}
                  {!expanded && order.status !== 'Delivered' && (
                    <View className="px-4 pb-4">
                      <PrimaryButton
                        label={NEXT_LABEL[order.status] || 'Advance'}
                        onPress={() => advanceStatus(order)}
                        loading={busy}
                      />
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
