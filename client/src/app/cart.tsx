import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore"; // <-- 1. Import Auth Store

// 🚨 IMPORTANT: Replace with your actual computer's Wi-Fi IPv4 address!
const API_URL = "http://192.168.1.9:5000/api/orders";

export default function CartScreen() {
  const router = useRouter();
  const { items, addItem, removeItem, getSubtotal, clearCart } = useCartStore((state: any) => state);
  
  // 2. Pull the user and their token from our Auth state
  const { user, token } = useAuthStore((state: any) => state);

  // Loading state for the checkout button
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 40 || subtotal === 0 ? 0 : 5.00; 
  const total = subtotal + deliveryFee;

  // 3. The actual Checkout Logic
  const handlePlaceOrder = async () => {
    // SECURITY CHECK: If they are not logged in, force them to the login screen
    if (!user || !token) {
      Alert.alert("Login Required", "Please sign in to place your order.");
      router.push('/login');
      return;
    }

    setIsCheckingOut(true);

    try {
      // Map our cart items to match what the backend Order Schema expects
      const orderItems = items.map((item: any) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id // MongoDB uses _id for the product reference
      }));

      // Send the POST request to the backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // Pass our JWT securely!
        },
        body: JSON.stringify({
          orderItems,
          deliveryAddress: "172 Grand St, New York", // Hardcoded UI address
          paymentMethod: "Card"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      // SUCCESS! Empty the cart and go to the success screen
      clearCart();
      router.push('/success');

    } catch (error: any) {
      console.error(error);
      Alert.alert("Checkout Error", error.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 flex-row items-center justify-between z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">My Cart</Text>
        <View className="w-10 h-10" /> 
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mx-6 mt-2 mb-6 bg-orange-50 p-4 rounded-2xl flex-row items-center">
          <View className="bg-orange-200 p-3 rounded-full mr-4">
            <Text className="text-xl">📍</Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-sm font-medium">Delivering to</Text>
            <Text className="text-gray-800 font-bold text-base">172 Grand St, New York</Text>
          </View>
          <Text className="text-orange-500 font-bold">Edit</Text>
        </View>

        {items.length === 0 ? (
          <View className="px-6 py-10 items-center justify-center">
            <Text className="text-gray-400 text-lg">Your cart is empty 🍔</Text>
          </View>
        ) : (
          <View className="px-6">
            {items.map((item: any) => (
              <View key={item._id || item.id} className="flex-row items-center mb-6 bg-white">
                <View className="bg-gray-50 rounded-2xl p-2 mr-4">
                  <Image source={{ uri: item.image }} className="w-16 h-16" resizeMode="contain" />
                </View>
                
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800 mb-1">{item.name}</Text>
                  <Text className="text-orange-500 font-extrabold text-base">${item.price.toFixed(2)}</Text>
                </View>

                <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1">
                  <TouchableOpacity 
                    onPress={() => item.qty > 1 ? addItem(item, -1) : removeItem(item._id || item.id)}
                    className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm"
                  >
                    <Text className="text-lg font-bold text-gray-600">-</Text>
                  </TouchableOpacity>
                  <Text className="px-3 font-bold text-gray-800">{item.qty}</Text>
                  <TouchableOpacity 
                    onPress={() => addItem(item, 1)}
                    className="w-8 h-8 bg-black rounded-full items-center justify-center shadow-sm"
                  >
                    <Text className="text-lg font-bold text-white">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {items.length > 0 && (
          <View className="px-6 mt-4 mb-8">
            <Text className="text-xl font-bold text-gray-800 mb-4">Order Summary</Text>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-500 text-base">Subtotal</Text>
              <Text className="text-gray-800 font-bold text-base">${subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-4 border-b border-gray-100 pb-4">
              <Text className="text-gray-500 text-base">Delivery Fee</Text>
              <Text className="text-gray-800 font-bold text-base">
                {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-800 font-bold text-xl">Total</Text>
              <Text className="text-orange-500 font-extrabold text-2xl">${total.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 4. Updated Checkout Button */}
      {items.length > 0 && (
        <View className="px-6 pb-8 pt-4 border-t border-gray-100 bg-white">
          <TouchableOpacity 
            onPress={handlePlaceOrder} 
            disabled={isCheckingOut}
            className={`h-16 rounded-full items-center justify-center shadow-sm flex-row ${isCheckingOut ? 'bg-orange-300' : 'bg-orange-500'}`}
          >
            {isCheckingOut && <ActivityIndicator color="white" className="mr-2" />}
            <Text className="text-white font-extrabold text-xl">
              {isCheckingOut ? "Processing..." : "Place Order"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}