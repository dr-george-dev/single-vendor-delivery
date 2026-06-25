import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { API_BASE_URL } from "../../config/api";

const API_URL = `${API_BASE_URL}/api/orders`;

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuthStore((state: any) => state);
  const { addItem, clearCart } = useCartStore((state: any) => state);
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Could not fetch order details');

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id, token, router]);

  const handleReorder = () => {
    if (!order?.orderItems) return;
    
    // Clear existing cart to start fresh with the reordered items
    clearCart();
    
    order.orderItems.forEach((item: any) => {
      addItem({ id: item.product, name: item.name, price: item.price, image: item.image }, item.qty);
    });
    
    router.push('/cart');
  };

  if (loading) return <ActivityIndicator className="flex-1" size="large" color="#f97316" />;
  if (!order) return <View className="flex-1 justify-center items-center"><Text className="text-gray-500">Order not found.</Text></View>;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
          <Feather name="chevron-left" size={24} color="#1a1c1e" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Order #{id.toString().slice(-6)}</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6 bg-gray-50 p-5 rounded-3xl border border-gray-100">
          <Text className="text-lg font-bold mb-4">Items</Text>
          {order.orderItems.map((item: any, i: number) => (
            <View key={i} className="flex-row justify-between py-2 border-b border-gray-200 last:border-0">
              <Text className="text-gray-700 font-medium">{item.qty}x {item.name}</Text>
              <Text className="font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-8">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Subtotal</Text>
            <Text className="font-bold">${order.subtotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between border-t border-gray-100 pt-3 mt-1">
            <Text className="font-extrabold text-xl">Total</Text>
            <Text className="font-extrabold text-xl text-orange-500">${order.totalPrice.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="p-6 border-t border-gray-100">
        <TouchableOpacity onPress={handleReorder} className="bg-[#1a1c1e] h-16 rounded-full items-center justify-center shadow-md">
          <Text className="text-white font-bold text-lg">Reorder Items</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}