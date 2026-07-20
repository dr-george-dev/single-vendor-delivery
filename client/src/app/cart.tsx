import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/api';
import { Brand } from '../constants/brand';
import { IconButton } from '../components/ui/IconButton';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { EmptyState } from '../components/ui/EmptyState';
import { PressableScale } from '../components/ui/PressableScale';

const API_URL = `${API_BASE_URL}/api/orders`;

export default function CartScreen() {
  const router = useRouter();
  const { items, addItem, removeItem, getSubtotal, clearCart } = useCartStore((state: any) => state);
  const { user, token } = useAuthStore((state: any) => state);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('172 Grand St, NY');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [note, setNote] = useState('');

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 40 || subtotal === 0 ? 0 : 5.0;
  const total = subtotal + deliveryFee;
  const freeDeliveryLeft = Math.max(0, 40 - subtotal);

  const handlePlaceOrder = async () => {
    if (!user || !token) {
      Alert.alert('Login Required', 'Please sign in to place your order.');
      router.push('/login');
      return;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert('Missing Details', 'Please enter a valid delivery address.');
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderItems = items.map((item: any) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id || item.id,
      }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderItems,
          deliveryAddress: deliveryAddress.trim(),
          paymentMethod,
          note: note.trim() || undefined,
          subtotal,
          deliveryFee,
          totalPrice: total,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to place order');

      clearCart();
      router.push({
        pathname: '/success',
        params: { orderId: data._id, address: deliveryAddress.trim() },
      });
    } catch (error: any) {
      Alert.alert('Checkout Error', error.message || 'Something went wrong');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Brand.bg }} edges={['top']}>
      <View className="px-5 py-3 flex-row items-center justify-between">
        <IconButton name="chevron-left" onPress={() => router.back()} />
        <Text className="text-lg font-black text-gray-900">Your cart</Text>
        <View className="w-11" />
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {items.length === 0 ? (
          <EmptyState
            icon="shopping-bag"
            title="Your cart is empty"
            subtitle="Browse the menu and add something delicious."
            actionLabel="Explore menu"
            onAction={() => router.replace('/')}
          />
        ) : (
          <>
            {/* Free delivery progress */}
            {freeDeliveryLeft > 0 ? (
              <View
                className="mb-5 p-4 rounded-2xl"
                style={{ backgroundColor: Brand.accentSoft, borderWidth: 1, borderColor: '#FFD9C8' }}
              >
                <View className="flex-row items-center mb-2">
                  <Feather name="truck" size={16} color={Brand.accent} />
                  <Text className="ml-2 font-bold text-sm" style={{ color: Brand.accentDark }}>
                    Add ${freeDeliveryLeft.toFixed(2)} more for free delivery
                  </Text>
                </View>
                <View className="h-2 rounded-full bg-white overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (subtotal / 40) * 100)}%`,
                      backgroundColor: Brand.accent,
                    }}
                  />
                </View>
              </View>
            ) : (
              <View
                className="mb-5 p-3.5 rounded-2xl flex-row items-center"
                style={{ backgroundColor: Brand.successSoft }}
              >
                <Feather name="check-circle" size={16} color={Brand.success} />
                <Text className="ml-2 font-bold text-sm text-emerald-700">
                  You unlocked free delivery
                </Text>
              </View>
            )}

            {/* Line items */}
            {items.map((item: any) => {
              const id = item._id || item.id;
              return (
                <View
                  key={id}
                  className="flex-row items-center mb-3.5 bg-white p-3 rounded-3xl"
                  style={{ borderWidth: 1, borderColor: Brand.border }}
                >
                  <View
                    className="rounded-2xl p-1.5 mr-3"
                    style={{ backgroundColor: Brand.bg, borderWidth: 1, borderColor: Brand.border }}
                  >
                    <Image source={{ uri: item.image }} className="w-14 h-14" resizeMode="contain" />
                  </View>

                  <View className="flex-1 mr-2">
                    <Text className="text-[14px] font-extrabold text-gray-900 mb-0.5" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="font-bold text-sm" style={{ color: Brand.accent }}>
                      ${item.price.toFixed(2)}
                    </Text>
                    <PressableScale onPress={() => removeItem(id)} className="mt-1 self-start">
                      <Text className="text-xs font-semibold text-gray-400">Remove</Text>
                    </PressableScale>
                  </View>

                  <QuantityStepper
                    size="sm"
                    value={item.qty}
                    min={0}
                    onIncrement={() => addItem(item, 1)}
                    onDecrement={() =>
                      item.qty > 1 ? addItem(item, -1) : removeItem(id)
                    }
                  />
                </View>
              );
            })}

            {/* Delivery */}
            <Text className="text-gray-900 font-extrabold text-base mt-4 mb-3">Delivery details</Text>
            <View
              className="bg-white rounded-2xl px-4 py-3.5 flex-row items-center mb-4"
              style={{ borderWidth: 1, borderColor: Brand.border }}
            >
              <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: Brand.accentSoft }}
              >
                <Feather name="map-pin" size={16} color={Brand.accent} />
              </View>
              <TextInput
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Enter delivery address"
                placeholderTextColor={Brand.mutedLight}
                className="flex-1 text-[15px] text-gray-800 font-medium"
              />
            </View>

            <View
              className="bg-white rounded-2xl px-4 py-3.5 flex-row items-center mb-5"
              style={{ borderWidth: 1, borderColor: Brand.border }}
            >
              <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: Brand.bg }}
              >
                <Feather name="edit-3" size={15} color={Brand.muted} />
              </View>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add a note for the kitchen (optional)"
                placeholderTextColor={Brand.mutedLight}
                className="flex-1 text-[15px] text-gray-800 font-medium"
              />
            </View>

            {/* Payment */}
            <Text className="text-gray-900 font-extrabold text-base mb-3">Payment</Text>
            <View className="flex-row mb-6">
              {[
                { key: 'Card', icon: 'credit-card' as const },
                { key: 'Crypto', icon: 'hash' as const },
                { key: 'Cash', icon: 'dollar-sign' as const },
              ].map((method) => {
                const active = paymentMethod === method.key;
                return (
                  <PressableScale
                    key={method.key}
                    onPress={() => setPaymentMethod(method.key)}
                    className="flex-1"
                    style={{ marginRight: method.key !== 'Cash' ? 8 : 0 }}
                  >
                    <View
                      className="flex-row items-center justify-center py-4 px-3 rounded-2xl"
                      style={{
                        backgroundColor: active ? Brand.accentSoft : Brand.surface,
                        borderWidth: 1.5,
                        borderColor: active ? Brand.accent : Brand.border,
                      }}
                    >
                      <Feather
                        name={method.icon}
                        size={17}
                        color={active ? Brand.accent : Brand.mutedLight}
                      />
                      <Text
                        className="font-extrabold ml-2"
                        style={{ color: active ? Brand.accent : Brand.muted }}
                      >
                        {method.key}
                      </Text>
                    </View>
                  </PressableScale>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View
          className="px-5 pt-4 bg-white border-t"
          style={{
            borderColor: Brand.border,
            paddingBottom: 20,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -4 },
            elevation: 8,
          }}
        >
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 font-medium text-sm">Subtotal</Text>
            <Text className="text-gray-900 font-bold text-sm">${subtotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-500 font-medium text-sm">Delivery</Text>
            <Text
              className="font-bold text-sm"
              style={{ color: deliveryFee === 0 ? Brand.success : Brand.ink }}
            >
              {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
            </Text>
          </View>
          <View className="flex-row justify-between mb-4 pt-3 border-t border-gray-100">
            <Text className="text-gray-900 font-extrabold text-base">Total</Text>
            <Text className="text-gray-900 font-black text-lg">${total.toFixed(2)}</Text>
          </View>
          <PrimaryButton
            label="Place order"
            rightLabel={`$${total.toFixed(2)}`}
            onPress={handlePlaceOrder}
            loading={isCheckingOut}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
