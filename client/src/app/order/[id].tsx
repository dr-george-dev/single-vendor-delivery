import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { API_BASE_URL } from '../../config/api';
import { Brand, ORDER_STATUS_META } from '../../constants/brand';
import { IconButton } from '../../components/ui/IconButton';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { Badge } from '../../components/ui/Badge';

const STEPS = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { token } = useAuthStore((s: any) => s);
  const addItem = useCartStore((s: any) => s.addItem);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Order not found');
        const data = await response.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchOrder();
    else {
      setLoading(false);
      setError(token ? 'Missing order id' : 'Please sign in to view this order');
    }
  }, [id, token]);

  const handleReorder = () => {
    if (!order?.orderItems) return;
    order.orderItems.forEach((item: any) => {
      addItem(
        {
          _id: item.product,
          id: item.product,
          name: item.name,
          price: item.price,
          image: item.image,
        },
        item.qty
      );
    });
    router.push('/cart');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: Brand.bg }}>
        <ActivityIndicator size="large" color={Brand.accent} />
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center px-8" style={{ backgroundColor: Brand.bg }}>
        <Feather name="alert-circle" size={40} color={Brand.danger} />
        <Text className="text-gray-900 font-bold text-lg mt-4 mb-2">Order unavailable</Text>
        <Text className="text-gray-500 text-center mb-6">{error}</Text>
        <PrimaryButton label="Go back" onPress={() => router.back()} variant="dark" className="px-10" />
      </SafeAreaView>
    );
  }

  const status = order.status || 'Pending';
  const statusMeta = ORDER_STATUS_META[status] || ORDER_STATUS_META.Pending;
  const currentStep = statusMeta.step;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Brand.bg }} edges={['top']}>
      <View className="px-5 py-3 flex-row items-center justify-between">
        <IconButton name="chevron-left" onPress={() => router.back()} />
        <Text className="text-lg font-black text-gray-900">Order details</Text>
        <View className="w-11" />
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Status card */}
        <View
          className="bg-white rounded-[28px] p-5 mb-5"
          style={{ borderWidth: 1, borderColor: Brand.border }}
        >
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-xs font-semibold text-gray-400 mb-1">
                ORDER #{String(order._id).slice(-6).toUpperCase()}
              </Text>
              <Text className="text-xl font-black text-gray-900">
                {statusMeta.label}
              </Text>
            </View>
            <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: statusMeta.bg }}>
              <Text className="text-xs font-extrabold uppercase" style={{ color: statusMeta.color }}>
                {statusMeta.label}
              </Text>
            </View>
          </View>

          {/* Timeline */}
          <View className="mt-2">
            {STEPS.map((step, index) => {
              const done = index <= currentStep;
              const active = index === currentStep;
              return (
                <View key={step} className="flex-row">
                  <View className="items-center mr-3">
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: done ? Brand.accent : Brand.bg,
                        borderWidth: done ? 0 : 1.5,
                        borderColor: Brand.border,
                      }}
                    >
                      {done ? (
                        <Feather name="check" size={14} color="#fff" />
                      ) : (
                        <Text className="text-[10px] font-bold text-gray-400">{index + 1}</Text>
                      )}
                    </View>
                    {index < STEPS.length - 1 && (
                      <View
                        className="w-0.5 flex-1 my-1"
                        style={{
                          minHeight: 22,
                          backgroundColor: index < currentStep ? Brand.accent : Brand.border,
                        }}
                      />
                    )}
                  </View>
                  <View className="pb-4 flex-1">
                    <Text
                      className="font-bold text-sm"
                      style={{ color: active ? Brand.ink : done ? Brand.inkSoft : Brand.mutedLight }}
                    >
                      {ORDER_STATUS_META[step]?.label || step}
                    </Text>
                    {active && (
                      <Text className="text-xs text-gray-400 mt-0.5">
                        Est. {order.estimatedTime || '25-35 min'}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Delivery */}
        <View
          className="bg-white rounded-[24px] p-4 mb-5 flex-row items-center"
          style={{ borderWidth: 1, borderColor: Brand.border }}
        >
          <View
            className="w-11 h-11 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: Brand.accentSoft }}
          >
            <Feather name="map-pin" size={18} color={Brand.accent} />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-semibold text-gray-400 mb-0.5">Delivering to</Text>
            <Text className="font-bold text-gray-900">{order.deliveryAddress}</Text>
          </View>
        </View>

        {/* Items */}
        <Text className="text-base font-extrabold text-gray-900 mb-3">Items</Text>
        {(order.orderItems || []).map((item: any, idx: number) => (
          <View
            key={`${item.product}-${idx}`}
            className="bg-white rounded-2xl p-3 mb-2.5 flex-row items-center"
            style={{ borderWidth: 1, borderColor: Brand.border }}
          >
            <View
              className="rounded-xl p-1 mr-3"
              style={{ backgroundColor: Brand.bg, borderWidth: 1, borderColor: Brand.border }}
            >
              <Image source={{ uri: item.image }} className="w-12 h-12" resizeMode="contain" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-gray-900 text-sm" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-xs text-gray-400 font-medium mt-0.5">Qty {item.qty}</Text>
            </View>
            <Text className="font-extrabold text-gray-900">
              ${(item.price * item.qty).toFixed(2)}
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View
          className="bg-white rounded-[24px] p-4 mt-3 mb-6"
          style={{ borderWidth: 1, borderColor: Brand.border }}
        >
          <Row label="Subtotal" value={`$${(order.subtotal ?? 0).toFixed(2)}`} />
          <Row
            label="Delivery"
            value={order.deliveryFee === 0 ? 'Free' : `$${(order.deliveryFee ?? 0).toFixed(2)}`}
            valueColor={order.deliveryFee === 0 ? Brand.success : Brand.ink}
          />
          <View className="h-px bg-gray-100 my-3" />
          <Row
            label="Total"
            value={`$${(order.totalPrice ?? 0).toFixed(2)}`}
            bold
          />
          <View className="flex-row items-center mt-3">
            <Badge
              label={order.isPaid ? 'Paid' : 'Unpaid'}
              tone={order.isPaid ? 'success' : 'muted'}
            />
            <Text className="text-xs text-gray-400 font-medium ml-2">
              via {order.paymentMethod || 'Card'}
            </Text>
          </View>
        </View>

        <PrimaryButton label="Reorder these items" onPress={handleReorder} variant="dark" />
        <View className="h-3" />
        <PrimaryButton label="Back to home" onPress={() => router.replace('/')} variant="ghost" />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  bold,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <View className="flex-row justify-between items-center mb-1.5">
      <Text className={bold ? 'font-extrabold text-gray-900' : 'text-gray-500 font-medium text-sm'}>
        {label}
      </Text>
      <Text
        className={bold ? 'font-black text-base text-gray-900' : 'font-bold text-sm'}
        style={{ color: valueColor || Brand.ink }}
      >
        {value}
      </Text>
    </View>
  );
}
