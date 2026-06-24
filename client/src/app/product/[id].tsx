import { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// We'll use the same dummy data here for now. 
// In Phase 4, we will fetch this data from your MongoDB backend!
const dummyProducts = [
  { 
    id: "1", 
    name: "Classic Cheeseburger", 
    price: 8.99, 
    rating: 4.8, 
    prepTime: "10-15 min",
    calories: "650 Kcal",
    description: "A juicy, 100% beef patty topped with melted American cheese, crisp lettuce, fresh tomato, and our secret sauce, all served on a toasted sesame seed bun.",
    image: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
  },
  { 
    id: "2", 
    name: "Pepperoni Pizza", 
    price: 12.99, 
    rating: 4.9, 
    prepTime: "20-25 min",
    calories: "950 Kcal",
    description: "Freshly baked pizza loaded with premium pepperoni slices, our signature tomato sauce, and gooey mozzarella cheese on a hand-tossed crust.",
    image: "https://cdn-icons-png.flaticon.com/512/3595/3595458.png" 
  },
];

export default function ProductDetailScreen() {
  const router = useRouter();
  // This grabs the "id" from the URL path
  const { id } = useLocalSearchParams(); 
  
  // Find the product that matches the URL ID
  const product = dummyProducts.find(p => p.id === id) || dummyProducts[0];

  // Local state to track how many items the user wants
  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 1. Header with Back Button */}
      <View className="px-6 py-4 flex-row items-center justify-between z-10">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Details</Text>
        {/* Placeholder for a favorite heart button */}
        <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
          <Text className="text-red-500">❤️</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 2. Product Image */}
        <View className="items-center justify-center h-72 bg-gray-50 rounded-b-[40px] shadow-sm mb-6">
          <Image 
            source={{ uri: product.image }} 
            className="w-56 h-56" 
            resizeMode="contain"
          />
        </View>

        {/* 3. Product Info */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-3xl font-extrabold text-gray-800 flex-1 mr-4">
              {product.name}
            </Text>
            <View className="flex-row items-center bg-yellow-100 px-3 py-1 rounded-full">
              <Text className="text-yellow-600 mr-1">⭐</Text>
              <Text className="font-bold text-yellow-700">{product.rating}</Text>
            </View>
          </View>

          {/* Quick Stats */}
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

          {/* Description */}
          <Text className="text-gray-500 leading-6 mb-8 text-base">
            {product.description}
          </Text>
        </View>
      </ScrollView>

      {/* 4. Bottom Cart Bar */}
      <View className="px-6 pb-8 pt-4 flex-row items-center justify-between border-t border-gray-100 bg-white">
        
        {/* Quantity Selector */}
        <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1">
          <TouchableOpacity 
            onPress={decrement}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <Text className="text-2xl font-bold text-gray-600">-</Text>
          </TouchableOpacity>
          
          <Text className="px-4 text-xl font-bold text-gray-800">{quantity}</Text>
          
          <TouchableOpacity 
            onPress={increment}
            className="w-10 h-10 bg-black rounded-full items-center justify-center shadow-sm"
          >
            <Text className="text-xl font-bold text-white">+</Text>
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity 
          // We will wire this to the Zustand cart and navigate to the cart screen in Phase 4
          onPress={() => router.push('/cart')} 
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