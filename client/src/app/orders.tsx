import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/orders/myorders`;

export default function OrdersScreen() {
  const router = useRouter();
  const { token, user } = useAuthStore((state: any) => state);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not logged in, boot them to login screen
    if (!token) {
      router.replace('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error("Failed to fetch orders");
        
        const data = await response.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Helper to format MongoDB dates
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">My Orders</Text>
        <View className="w-10 h-10" /> 
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 font-bold text-center mb-4">{error}</Text>
          <TouchableOpacity onPress={() => router.back()} className="bg-orange-500 px-6 py-3 rounded-full">
            <Text className="text-white font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-400 text-lg mb-4">You haven't placed any orders yet 🍔</Text>
          <TouchableOpacity onPress={() => router.push('/')} className="bg-orange-500 px-6 py-3 rounded-full">
            <Text className="text-white font-bold">Start Browsing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          {orders.map((order: any) => (
            <View key={order._id} className="bg-gray-50 rounded-2xl p-5 mb-4 border border-gray-100 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-gray-500">{formatDate(order.createdAt)}</Text>
                <View className="bg-orange-100 px-3 py-1 rounded-full">
                  <Text className="text-orange-600 font-bold text-xs uppercase">{order.status}</Text>
                </View>
              </View>
              
              <View className="border-b border-gray-200 pb-3 mb-3">
                {order.orderItems.map((item: any, index: number) => (
                  <Text key={index} className="text-gray-800 font-medium mb-1">
                    {item.qty}x {item.name}
                  </Text>
                ))}
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500 text-sm">Total</Text>
                <Text className="text-orange-500 font-extrabold text-lg">${order.totalPrice.toFixed(2)}</Text>
              </View>
            </View>
          ))}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}