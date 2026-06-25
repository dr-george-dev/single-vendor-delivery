import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/orders`;

export default function CartScreen() {
  const router = useRouter();
  const { items, addItem, removeItem, getSubtotal, clearCart } = useCartStore((state: any) => state);
  const { user, token } = useAuthStore((state: any) => state);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 40 || subtotal === 0 ? 0 : 5.00; 
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user || !token) {
      Alert.alert("Login Required", "Please sign in to place your order.");
      router.push('/login');
      return;
    }
    setIsCheckingOut(true);
    try {
      const orderItems = items.map((item: any) => ({
        name: item.name, qty: item.qty, image: item.image, price: item.price, product: item._id
      }));
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderItems, deliveryAddress: "172 Grand St, NY", paymentMethod: "Card" })
      });
      if (!response.ok) throw new Error('Failed to place order');
      clearCart();
      router.push('/success');
    } catch (error: any) {
      Alert.alert("Checkout Error", error.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fa]">
      <View className="px-6 py-4 flex-row items-center justify-between z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100">
          <Feather name="chevron-left" size={24} color="#1a1c1e" />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-gray-900">My Cart</Text>
        <View className="w-12 h-12" /> 
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Ionicons name="cart-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-400 text-lg font-medium mt-4">Your cart is empty</Text>
          </View>
        ) : (
          <View className="mt-4">
            {items.map((item: any) => (
              <View key={item._id || item.id} className="flex-row items-center mb-6">
                <View className="bg-white rounded-3xl p-2 mr-4 shadow-sm border border-gray-100">
                  <Image source={{ uri: item.image }} className="w-16 h-16" resizeMode="contain" />
                </View>
                
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">{item.name}</Text>
                  <Text className="text-gray-400 text-xs mb-2">Extra cheese, no onion</Text>
                  <Text className="text-orange-500 font-extrabold text-base">${item.price.toFixed(2)}</Text>
                </View>

                <View className="flex-row items-center bg-white rounded-full px-1 border border-gray-100 shadow-sm">
                  <TouchableOpacity onPress={() => item.qty > 1 ? addItem(item, -1) : removeItem(item.id)} className="w-8 h-8 rounded-full items-center justify-center">
                    <Feather name="minus" size={16} color="#4b5563" />
                  </TouchableOpacity>
                  <Text className="px-2 font-bold text-gray-900">{item.qty}</Text>
                  <TouchableOpacity onPress={() => addItem(item, 1)} className="w-8 h-8 rounded-full items-center justify-center">
                    <Feather name="plus" size={16} color="#4b5563" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {items.length > 0 && (
          <View className="mt-4 mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-3">Payment Method</Text>
            <View className="flex-row justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
              <View className="flex-row items-center">
                <View className="bg-[#1a1c1e] px-3 py-1 rounded-md mr-4">
                  <Text className="text-white font-bold italic">VISA</Text>
                </View>
                <Text className="font-bold text-gray-800 text-base">Card</Text>
                <Text className="text-gray-500 ml-2">**** 5453</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-3">Promo code</Text>
            <View className="bg-white rounded-2xl p-1 flex-row items-center border border-gray-100 shadow-sm mb-8">
              <View className="pl-4 pr-2">
                <Feather name="tag" size={20} color="#9ca3af" />
              </View>
              <TextInput placeholder="Enter promo code" className="flex-1 h-12 font-medium" />
              <TouchableOpacity className="bg-[#1a1c1e] px-6 h-10 rounded-xl justify-center mr-1">
                <Text className="text-white font-bold">Apply</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6">
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-500 font-medium text-base">Subtotal</Text>
                <Text className="text-gray-900 font-bold text-base">${subtotal.toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between mb-4 border-b border-gray-100 pb-4">
                <Text className="text-gray-500 font-medium text-base">Delivery</Text>
                <Text className="text-green-500 font-bold text-base">
                  {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-900 font-extrabold text-xl">Total</Text>
                <Text className="text-gray-900 font-extrabold text-2xl">${total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View className="px-6 pb-8 pt-4">
          <TouchableOpacity 
            onPress={handlePlaceOrder} 
            disabled={isCheckingOut}
            className={`h-16 rounded-full items-center justify-between px-6 flex-row shadow-md ${isCheckingOut ? 'bg-gray-800' : 'bg-[#1a1c1e]'}`}
          >
            <Text className="text-white font-extrabold text-lg">Checkout</Text>
            {isCheckingOut ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-extrabold text-lg">${total.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}