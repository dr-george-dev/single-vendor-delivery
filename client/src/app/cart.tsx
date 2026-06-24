import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartStore } from "../store/cartStore"; // <-- 1. Import our global store

export default function CartScreen() {
  const router = useRouter();
  
  // 2. Fetch our dynamic state and actions from Zustand instead of using dummy data
  const { items, addItem, removeItem, getSubtotal } = useCartStore((state: any) => state);

  // 3. Dynamic pricing logic
  const subtotal = getSubtotal();
  // Free delivery over $40, but also don't charge delivery if cart is empty!
  const deliveryFee = subtotal > 40 || subtotal === 0 ? 0 : 5.00; 
  const total = subtotal + deliveryFee;

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

        {/* Display empty state if nothing in cart */}
        {items.length === 0 ? (
          <View className="px-6 py-10 items-center justify-center">
            <Text className="text-gray-400 text-lg">Your cart is empty 🍔</Text>
          </View>
        ) : (
          <View className="px-6">
            {items.map((item: any) => (
              <View key={item.id} className="flex-row items-center mb-6 bg-white">
                <View className="bg-gray-50 rounded-2xl p-2 mr-4">
                  <Image source={{ uri: item.image }} className="w-16 h-16" resizeMode="contain" />
                </View>
                
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800 mb-1">{item.name}</Text>
                  <Text className="text-orange-500 font-extrabold text-base">${item.price}</Text>
                </View>

                {/* 4. Wire up the modifier buttons to update the global store */}
                <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1">
                  <TouchableOpacity 
                    onPress={() => item.qty > 1 ? addItem(item, -1) : removeItem(item.id)}
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

      {/* Only show Checkout if there are items */}
      {items.length > 0 && (
        <View className="px-6 pb-8 pt-4 border-t border-gray-100 bg-white">
          <TouchableOpacity 
            onPress={() => router.push('/success')} 
            className="bg-orange-500 h-16 rounded-full items-center justify-center shadow-sm"
          >
            <Text className="text-white font-extrabold text-xl">Place Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}