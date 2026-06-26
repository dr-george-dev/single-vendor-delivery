import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TextInput, // <-- Imported correctly for mobile!
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/orders`;

export default function CartScreen() {
  const router = useRouter();
  const { items, addItem, removeItem, getSubtotal, clearCart } = useCartStore((state: any) => state);
  const { user, token } = useAuthStore((state: any) => state);
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // --- Issue 4 States ---
  const [deliveryAddress, setDeliveryAddress] = useState("172 Grand St, NY");
  const [paymentMethod, setPaymentMethod] = useState("Card");

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 40 || subtotal === 0 ? 0 : 5.0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user || !token) {
      Alert.alert("Login Required", "Please sign in to place your order.");
      router.push("/login");
      return;
    }

    // Validation for Issue 4 address input
    if (!deliveryAddress.trim()) {
      Alert.alert("Missing Details", "Please enter a valid delivery address.");
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderItems,
          // Sending the dynamic Issue 4 states
          deliveryAddress: deliveryAddress.trim(),
          paymentMethod: paymentMethod,
          subtotal,
          deliveryFee,
          totalPrice: total,
        }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to place order");

      clearCart();
      
      router.push({
        pathname: "/success",
        params: { orderId: data._id },
      });
    } catch (error: any) {
      Alert.alert("Checkout Error", error.message || "Something went wrong");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f6f8]">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100"
        >
          <Feather name="chevron-left" size={24} color="#001f3f" />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-[#001f3f]">My Cart</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Ionicons name="cart-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-400 text-lg font-medium mt-4">
              Your cart is empty
            </Text>
          </View>
        ) : (
          <View className="mt-4">
            
            {/* Cart Items List */}
            {items.map((item: any) => (
              <View
                key={item._id || item.id}
                className="flex-row items-center mb-6 bg-white p-3 rounded-3xl border border-gray-100 shadow-sm"
              >
                <View className="bg-white rounded-2xl p-1 mr-4 border border-gray-100 shadow-sm">
                  <Image
                    source={{ uri: item.image }}
                    className="w-14 h-14"
                    resizeMode="contain"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-[#001f3f] mb-1">
                    {item.name}
                  </Text>
                  <Text className="text-[#f97316] font-extrabold text-sm">
                    ${item.price.toFixed(2)}
                  </Text>
                </View>

                {/* Minimal Quantity Pill */}
                <View className="flex-row items-center bg-white rounded-full px-2 py-1 shadow-sm border border-gray-100 ml-2">
                  <TouchableOpacity
                    onPress={() =>
                      item.qty > 1
                        ? addItem(item, -1)
                        : removeItem(item._id || item.id)
                    }
                    className="px-2"
                  >
                    <Feather name="minus" size={14} color="#6b7280" />
                  </TouchableOpacity>
                  <Text className="px-2 font-bold text-[#001f3f] text-sm">
                    {item.qty}
                  </Text>
                  <TouchableOpacity
                    onPress={() => addItem(item, 1)}
                    className="px-2"
                  >
                    <Feather name="plus" size={14} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* --- Issue 4: Checkout Form --- */}
            <View className="mt-4 pt-6 border-t border-gray-200 mb-8">
              <Text className="text-[#001f3f] font-bold text-base mb-3">Delivery Address</Text>
              <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center border border-gray-100 shadow-sm mb-6">
                <Feather name="map-pin" size={18} color="#f97316" className="mr-3" />
                <TextInput 
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  placeholder="Enter delivery address"
                  className="flex-1 text-base text-gray-800 font-medium"
                />
              </View>

              <Text className="text-[#001f3f] font-bold text-base mb-3">Payment Method</Text>
              <View className="flex-row justify-between">
                <TouchableOpacity 
                  onPress={() => setPaymentMethod("Card")}
                  className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border shadow-sm ${paymentMethod === 'Card' ? 'border-[#f97316] bg-orange-50' : 'border-gray-200 bg-white'} mr-2`}
                >
                  <Feather name="credit-card" size={18} color={paymentMethod === 'Card' ? '#f97316' : '#9ca3af'} className="mr-2" />
                  <Text className={`font-bold ${paymentMethod === 'Card' ? 'text-[#f97316]' : 'text-gray-500'}`}>Card</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setPaymentMethod("Cash")}
                  className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border shadow-sm ${paymentMethod === 'Cash' ? 'border-[#f97316] bg-orange-50' : 'border-gray-200 bg-white'} ml-2`}
                >
                  <Feather name="dollar-sign" size={18} color={paymentMethod === 'Cash' ? '#f97316' : '#9ca3af'} className="mr-2" />
                  <Text className={`font-bold ${paymentMethod === 'Cash' ? 'text-[#f97316]' : 'text-gray-500'}`}>Cash</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* ----------------------------- */}
            
          </View>
        )}
      </ScrollView>

      {/* Checkout Footer matching the screenshot */}
      {items.length > 0 && (
        <View className="p-6 bg-white border-t border-gray-100 shadow-lg">
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500 font-medium text-sm">Subtotal</Text>
            <Text className="text-[#001f3f] font-bold text-sm">${subtotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-6">
            <Text className="text-gray-500 font-medium text-sm">Delivery Fee</Text>
            <Text className="text-[#001f3f] font-bold text-sm">{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</Text>
          </View>
          <TouchableOpacity
            disabled={isCheckingOut}
            onPress={handlePlaceOrder}
            className={`h-14 rounded-full items-center justify-center shadow-sm ${isCheckingOut ? "bg-orange-300" : "bg-orange-500"}`}
          >
            {isCheckingOut ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                Checkout (${total.toFixed(2)})
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}