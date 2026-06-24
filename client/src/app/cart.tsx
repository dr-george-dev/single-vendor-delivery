import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

// Dummy cart data for UI building
const initialCart = [
  { 
    id: "1", 
    name: "Classic Cheeseburger", 
    price: 8.99, 
    qty: 2,
    image: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
  },
  { 
    id: "2", 
    name: "Pepperoni Pizza", 
    price: 12.99, 
    qty: 1,
    image: "https://cdn-icons-png.flaticon.com/512/3595/3595458.png" 
  },
];

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(initialCart);

  // Quick math for our summary
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = subtotal > 40 ? 0 : 5.00; 
  const total = subtotal + deliveryFee;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 1. Header */}
      <View className="px-6 py-4 flex-row items-center justify-between z-10">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">My Cart</Text>
        <View className="w-10 h-10" /> {/* Empty view to perfectly center the title */}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* 2. Delivery Address Banner */}
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

        {/* 3. Cart Items List */}
        <View className="px-6">
          {cartItems.map((item, index) => (
            <View key={item.id} className="flex-row items-center mb-6 bg-white">
              <View className="bg-gray-50 rounded-2xl p-2 mr-4">
                <Image 
                  source={{ uri: item.image }} 
                  className="w-16 h-16" 
                  resizeMode="contain"
                />
              </View>
              
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800 mb-1">{item.name}</Text>
                <Text className="text-orange-500 font-extrabold text-base">${item.price}</Text>
              </View>

              {/* Mini Quantity Selector */}
              <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1">
                <TouchableOpacity className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm">
                  <Text className="text-lg font-bold text-gray-600">-</Text>
                </TouchableOpacity>
                <Text className="px-3 font-bold text-gray-800">{item.qty}</Text>
                <TouchableOpacity className="w-8 h-8 bg-black rounded-full items-center justify-center shadow-sm">
                  <Text className="text-lg font-bold text-white">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* 4. Order Summary */}
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
      </ScrollView>

      {/* 5. Checkout Button */}
      <View className="px-6 pb-8 pt-4 border-t border-gray-100 bg-white">
        <TouchableOpacity 
          // Routes to our success screen that we will build next
          onPress={() => router.push('/success')} 
          className="bg-orange-500 h-16 rounded-full items-center justify-center shadow-sm"
        >
          <Text className="text-white font-extrabold text-xl">Place Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}