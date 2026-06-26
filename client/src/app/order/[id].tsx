import { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useCartStore } from "../../store/cartStore";
import { API_BASE_URL } from "../../config/api";

const API_URL = `${API_BASE_URL}/api/products`;

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams(); 
  const addItem = useCartStore((state: any) => state.addItem);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

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

  if (loading) {
    return (
      <View className="flex-1 bg-[#FAFAFA] justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 bg-[#FAFAFA] justify-center items-center">
        <Text className="text-red-500 font-bold mb-4">Error: {error || "Product not found"}</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-black px-6 py-3 rounded-full">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate simulated original price if not provided by API
  const originalPrice = product.originalPrice || (product.price * 1.3).toFixed(2);
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <View className="flex-1 bg-[#FAFAFA]" style={{ paddingTop: insets.top }}>
      {/* Header Controls */}
      <View className="px-6 py-2 flex-row justify-between items-center absolute w-full top-0 z-10" style={{ marginTop: insets.top }}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 bg-white/80 rounded-full items-center justify-center shadow-sm"
        >
          <Feather name="chevron-down" size={24} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 bg-white/80 rounded-full items-center justify-center shadow-sm">
          <Feather name="more-horizontal" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View className="w-full h-72 items-center justify-center mb-4 mt-8">
          <Image 
            source={{ uri: product.image || 'https://via.placeholder.com/400' }} 
            className="w-[90%] h-[90%]" 
            resizeMode="contain" 
          />
        </View>

        {/* Content Container */}
        <View className="px-6 bg-white rounded-t-[40px] pt-8 pb-32 flex-1 shadow-sm border border-gray-50">
          {/* Tag */}
          <View className="bg-[#FFF4E6] px-3 py-1 rounded-md self-start mb-4">
            <Text className="text-orange-500 text-xs font-bold tracking-wide">Popular</Text>
          </View>

          {/* Title */}
          <Text className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
            {product.name}
          </Text>

          {/* Pricing Row */}
          <View className="flex-row items-center mb-6">
            <Text className="text-2xl font-black text-red-500 mr-3">
              ${(product.price || 13.93).toFixed(2)}
            </Text>
            <Text className="text-lg font-bold text-gray-400 line-through mr-3">
              ${originalPrice}
            </Text>
            <View className="bg-red-50 px-2 py-0.5 rounded">
              <Text className="text-red-500 font-bold text-xs">{discount}% off</Text>
            </View>
          </View>

          {/* Metrics Row (Rating, Time, Calories) */}
          <View className="flex-row justify-between mb-8">
            <View className="items-center flex-1">
              <Ionicons name="star" size={24} color="#F59E0B" className="mb-1" />
              <Text className="text-lg font-bold text-gray-900">{product.rating || '4.9'}</Text>
              <Text className="text-gray-400 text-xs font-medium">Rating</Text>
            </View>
            
            <View className="w-[1px] h-full bg-gray-200" />
            
            <View className="items-center flex-1">
              <Feather name="clock" size={24} color="#111" className="mb-1" />
              <Text className="text-lg font-bold text-gray-900">{product.prepTime || '25'}</Text>
              <Text className="text-gray-400 text-xs font-medium">Min away</Text>
            </View>

            <View className="w-[1px] h-full bg-gray-200" />

            <View className="items-center flex-1">
              <Feather name="activity" size={24} color="#ef4444" className="mb-1" />
              <Text className="text-lg font-bold text-gray-900">{product.calories || '895'}</Text>
              <Text className="text-gray-400 text-xs font-medium">Kcal</Text>
            </View>
          </View>

          {/* Description */}
          <Text className="text-lg font-bold text-gray-900 mb-2">Description</Text>
          <Text className="text-gray-500 leading-6 text-[15px]">
            {product.description || "A juicy double BBQ burger with two beef patties, melted cheddar cheese and fresh leaf lettuce, topped with a rich smoky BBQ sauce. Served on a toasted sesame seed bun with a side of fries."}
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View 
        className="absolute bottom-0 w-full bg-white px-6 py-4 flex-row justify-between items-center border-t border-gray-100 shadow-lg"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}
      >
        {/* Quantity Selector */}
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={decrement} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="minus" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <Text className="px-5 text-xl font-bold text-gray-900">{quantity}</Text>
          <TouchableOpacity 
            onPress={increment} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="plus" size={20} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity 
          onPress={handleAddToCart}
          className="bg-black h-14 rounded-full px-8 flex-row items-center justify-center shadow-sm ml-4 flex-1"
        >
          <Text className="text-white font-bold text-base mr-auto">Add to cart</Text>
          <Text className="text-white font-extrabold text-base">
            ${(product.price * quantity).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}