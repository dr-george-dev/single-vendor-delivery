import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Brand, ORDER_STATUS_META } from '../../constants/brand';
import { PressableScale } from '../ui/PressableScale';
import { PrimaryButton } from '../ui/PrimaryButton';
import { useKitchenStore, type Order } from '../../store/kitchenStore';
 
const NEXT_LABEL: Record<string, string> = {
  Pending: 'Start preparing',
  Preparing: 'Out for delivery',
  'Out for Delivery': 'Mark delivered',
};
 
// React.memo prevents re-renders unless the specific order object changes
export const OrderCard = React.memo(
  ({ order, token }: { order: Order; token: string }) => {
    const [expanded, setExpanded] = useState(false);
    const advanceOrderStatus = useKitchenStore((s) => s.advanceOrderStatus);
    const setOrderStatus = useKitchenStore((s) => s.setOrderStatus);
 
    const meta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.Pending;
    const shortId = order._id.slice(-6).toUpperCase();
    const itemCount = order.orderItems?.reduce((n, i) => n + i.qty, 0) || 0;
    const ageMin = order.createdAt
      ? Math.max(0, Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000))
      : null;
 
    const handleAdvance = () => {
      advanceOrderStatus(order._id, order.status, token);
    };
 
    return (
      <View
        className="bg-white rounded-[24px] mb-3.5 overflow-hidden"
        style={{
          borderWidth: 1.5,
          borderColor: order.status === 'Pending' ? Brand.accent : Brand.border,
        }}
      >
        <PressableScale onPress={() => setExpanded(!expanded)} scaleTo={0.99}>
          <View className="p-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-3">
                <Text className="text-xs font-semibold text-gray-400 mb-0.5">
                  #{shortId}
                  {ageMin != null ? ` · ${ageMin}m ago` : ''}
                </Text>
                <Text className="text-base font-black text-gray-900">
                  {order.user?.name || 'Customer'}
                </Text>
                {order.deliveryAddress ? (
                  <Text className="text-sm text-gray-500 font-medium mt-0.5" numberOfLines={1}>
                    {order.deliveryAddress}
                  </Text>
                ) : null}
              </View>
              <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: meta.bg }}>
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
                {itemCount} item{itemCount === 1 ? '' : 's'}
                {order.paymentMethod ? ` · ${order.paymentMethod}` : ''}
                {order.isPaid != null ? (order.isPaid ? ' · Paid' : ' · Unpaid') : ''}
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
                    +{(order.orderItems?.length || 0) - 4} more
                  </Text>
                </View>
              )}
            </View>
          </View>
        </PressableScale>
 
        {/* Expanded ticket details */}
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
 
            {(order.user?.name || order.user?.email) && (
              <>
                <View className="h-px bg-gray-100 my-2" />
                <Text className="text-xs text-gray-400 font-medium mb-1">Customer</Text>
                <Text className="text-sm font-bold text-gray-800 mb-3">
                  {[order.user?.name, order.user?.email].filter(Boolean).join(' · ')}
                </Text>
              </>
            )}
 
            {order.status !== 'Delivered' && (
              <PrimaryButton
                label={NEXT_LABEL[order.status] || 'Advance'}
                onPress={handleAdvance}
                className="mb-2"
              />
            )}
 
            {order.status !== 'Delivered' && setOrderStatus && (
              <View className="flex-row flex-wrap gap-2 mt-1">
                {(['Pending', 'Preparing', 'Out for Delivery', 'Delivered'] as const)
                  .filter((s) => s !== order.status)
                  .map((s) => (
                    <PressableScale
                      key={s}
                      onPress={() => setOrderStatus(order._id, s, token)}
                      scaleTo={0.96}
                    >
                      <View
                        className="px-3 py-2 rounded-full"
                        style={{
                          backgroundColor: ORDER_STATUS_META[s].bg,
                          borderWidth: 1,
                          borderColor: Brand.border,
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
              onPress={handleAdvance}
            />
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.order.status === nextProps.order.status &&
      prevProps.order._id === nextProps.order._id &&
      prevProps.token === nextProps.token &&
      prevProps.order.totalPrice === nextProps.order.totalPrice
    );
  }
);