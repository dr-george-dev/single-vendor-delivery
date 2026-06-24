import { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartStore } from "../../store/cartStore"; // <-- 1. Import our global store

// Dummy data (We will replace this with a backend API fetch in Day 24)
const dummyProducts = [
  { id: "1", name: "Classic Cheeseburger", price: 8.99, rating: 4.8, prepTime: "10-15 min", calories: "650 Kcal", description: "A juicy, 100% beef patty topped with melted American cheese...", image: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png" },
  { id: "2", name: "Pepperoni Pizza", price: 12.99, rating: 4.9, prepTime: "20-25 min", calories: "950 Kcal", description: "Freshly baked pizza loaded with premium pepperoni slices...", image: "https://cdn-icons-png.flaticon.com/512/3595/3595458.png" },
];

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const product = dummyProducts.find(p => p.id === id) || dummyProducts[0];

  // 2. Bring in the addItem function from Zustand
  const addItem = useCartStore((state: any) => state.addItem);

  // Local state just for tracking the UI counter before adding to cart
  const [quantity, setQuantity] = useState(1);
  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    // 3. Save the item and quantity to our global store, then navigate
    addItem(product, quantity);
    router.push('/cart');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 flex-row items-center justify-between z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Details</Text>
        <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
          <Text className="text-red-500">❤️</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center justify-center h-72 bg-gray-50 rounded-b-[40px] shadow-sm mb-6">
          <Image source={{ uri: product.image }} className="w-56 h-56" resizeMode="contain" />
        </View>

        <View className="px-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-3xl font-extrabold text-gray-800 flex-1 mr-4">{product.name}</Text>
            <View className="flex-row items-center bg-yellow-100 px-3 py-1 rounded-full">
              <Text className="text-yellow-600 mr-1">⭐</Text>
              <Text className="font-bold text-yellow-700">{product.rating}</Text>
            </View>
          </View>

          <View className="flex-row mt-4 mb-6">
            <View className="flex-row items-center mr-6">
              <Text className="text-orange-500 mr-2 text-lg">🔥</Text>
              <Text className="text-gray-500 font-medium">{product.calories}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-orange-500 mr-2 text-lg">⏱️</Text>
              <Text className="text-gray-500 font-medium">{product.prepTime}</Text>
            </View>
          </View>

          <Text className="text-gray-500 leading-6 mb-8 text-base">{product.description}</Text>
        </View>
      </ScrollView>

      <View className="px-6 pb-8 pt-4 flex-row items-center justify-between border-t border-gray-100 bg-white">
        <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1">
          <TouchableOpacity onPress={decrement} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
            <Text className="text-2xl font-bold text-gray-600">-</Text>
          </TouchableOpacity>
          <Text className="px-4 text-xl font-bold text-gray-800">{quantity}</Text>
          <TouchableOpacity onPress={increment} className="w-10 h-10 bg-black rounded-full items-center justify-center shadow-sm">
            <Text className="text-xl font-bold text-white">+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleAddToCart} // <-- 4. Attach our handler here
          className="bg-orange-500 flex-1 ml-6 h-14 rounded-full items-center justify-center flex-row shadow-sm"
        >
          <Text className="text-white font-bold text-lg mr-2">Add to Cart</Text>
          <Text className="text-white font-extrabold text-lg">
            ${(product.price * quantity).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}