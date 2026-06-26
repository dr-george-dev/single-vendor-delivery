import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from "../store/authStore";
import { API_BASE_URL } from "../config/api";

export default function OrdersScreen() {
  const router = useRouter();
  const { token } = useAuthStore((state: any) => state);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        // Assuming your backend route for fetching a user's orders is /api/orders/mine
        const response = await fetch(`${API_BASE_URL}/api/orders/mine`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to fetch your orders");

        const data = await response.json();
        // Sort orders so the newest ones appear at the top
        const sortedData = data.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedData);
      } catch (error: any) {
        console.error(error);
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f8f9fa] justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fa]">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4"
        >
          <Feather name="chevron-left" size={24} color="#1a1c1e" />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-gray-900">Order History</Text>
      </View>

      {/* Orders List */}
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View className="py-20 items-center justify-center mt-10">
            <Feather name="package" size={64} color="#d1d5db" />
            <Text className="text-gray-400 text-lg font-medium mt-4">You have no orders yet</Text>
            <TouchableOpacity 
              onPress={() => router.push('/')} 
              className="mt-8 bg-[#1a1c1e] px-8 py-4 rounded-full shadow-md"
            >
               <Text className="text-white font-bold text-base">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order: any) => (
            <TouchableOpacity 
              key={order._id}
              // This routes exactly to the client/app/order/[id].tsx screen we built
              onPress={() => router.push(`/order/${order._id}`)}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-5 active:opacity-80"
            >
              <View className="flex-row justify-between items-center mb-3 border-b border-gray-50 pb-3">
                <Text className="font-bold text-gray-900 text-base">Order #{order._id.slice(-6).toUpperCase()}</Text>
                <View className="bg-green-100 px-3 py-1.5 rounded-full">
                  <Text className="text-green-700 text-xs font-bold uppercase tracking-wider">
                    {order.isDelivered ? 'Delivered' : 'Processing'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center mt-2">
                <View>
                  <Text className="text-gray-500 font-medium mb-1">
                    {order.orderItems?.length || 0} {order.orderItems?.length === 1 ? 'item' : 'items'}
                  </Text>
                  <Text className="text-xs text-gray-400 font-medium">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                <Text className="font-extrabold text-xl text-gray-900">
                  ${order.totalPrice?.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}