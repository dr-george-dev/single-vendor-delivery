import { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartStore } from "../../store/cartStore";
import { API_BASE_URL } from "../../config/api";

const API_URL = `${API_BASE_URL}/api/products`;

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const addItem = useCartStore((state: any) => state.addItem);

  // New state variables for API data
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [quantity, setQuantity] = useState(1);

  // Fetch the single product from MongoDB when the screen loads
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchProduct();
  }, [id]);

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addItem(product, quantity);
    router.push('/cart');
  };

  // Loading UI
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  // Error UI
  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-red-500 font-bold mb-4">Error: {error || "Product not found"}</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-orange-500 px-6 py-3 rounded-full">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
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
              <Text className="text-gray-500 font-medium">{product.calories || 'N/A'} Kcal</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-orange-500 mr-2 text-lg">⏱️</Text>
              <Text className="text-gray-500 font-medium">{product.prepTime} min</Text>
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
          onPress={handleAddToCart}
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