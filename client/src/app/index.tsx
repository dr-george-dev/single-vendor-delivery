import { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuthStore } from "../store/authStore";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/products`;

const categories = ["Burgers", "Pizza", "Sides", "Combos", "Drinks"];

export default function HomeScreen() {
  const router = useRouter();
  const { token } = useAuthStore((state: any) => state);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Burgers");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchProducts();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-2 pb-6">
          <View>
            <Text className="text-gray-400 text-xs mb-1">Deliver to</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-900 font-bold text-base mr-1">172 Grand St, NY</Text>
              <Feather name="chevron-down" size={16} color="#111" />
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => router.push(token ? '/profile' : '/login')} 
            className="w-12 h-12 bg-red-100 rounded-full items-center justify-center border border-red-200"
          >
            <Text className="text-xl font-bold text-red-600">Z</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Search Bar */}
          <View className="px-6 mb-6">
            <View className="bg-white rounded-2xl px-4 py-3.5 flex-row items-center shadow-sm border border-gray-100">
              <Feather name="search" size={20} color="#9ca3af" />
              <TextInput 
                placeholder="Search food, drinks, more..." 
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-base text-gray-800 ml-3 font-medium"
              />
            </View>
          </View>

          {/* Category Pills */}
          <View className="mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  onPress={() => setSelectedCategory(cat)}
                  className={`mr-4 p-3 rounded-full w-[72px] items-center ${selectedCategory === cat ? 'bg-white shadow-sm border border-gray-100' : ''}`}
                >
                  <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mb-2">
                    <Text className="text-2xl">{cat === "Burgers" ? "🍔" : cat === "Pizza" ? "🍕" : cat === "Sides" ? "🍟" : cat === "Combos" ? "🍱" : "🥤"}</Text>
                  </View>
                  <Text className={`font-semibold text-xs ${selectedCategory === cat ? 'text-gray-900' : 'text-gray-400'}`}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Promo Banner */}
          <View className="px-6 mb-8">
            <View className="bg-[#1C1C1C] rounded-[28px] p-6 relative overflow-hidden h-48 justify-center">
              {/* Optional: Add an absolute Image here for the burger background shown in video */}
              <View className="bg-white/10 self-start px-2.5 py-1 rounded-md mb-3 flex-row items-center">
                <Text className="text-white text-[10px] font-bold tracking-widest">✦ FIRST ORDER</Text>
              </View>
              <Text className="text-white text-3xl font-bold w-3/4 mb-1 leading-9">Free delivery on your first order</Text>
              <Text className="text-gray-400 text-xs mb-4">No code needed, ends tonight</Text>
              <TouchableOpacity className="bg-white rounded-full self-start px-5 py-2.5 flex-row items-center">
                <Text className="text-black font-bold text-sm mr-2">Order now</Text>
                <Feather name="arrow-right" size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Popular Now Header */}
          <View className="px-6 flex-row justify-between items-end mb-4">
            <Text className="text-xl font-bold text-gray-900">Popular now</Text>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text className="text-red-500 font-semibold text-sm">See all</Text>
            </TouchableOpacity>
          </View>

          {/* Product Grid */}
          <View className="px-6 pb-24">
            {loading ? <ActivityIndicator size="large" color="#000" /> : (
              <View className="flex-row flex-wrap justify-between">
                {filteredProducts.map((product: any) => (
                  <TouchableOpacity 
                    key={product._id} 
                    onPress={() => router.push(`/product/${product._id}`)} 
                    className="bg-white p-3 rounded-[24px] w-[48%] mb-4 shadow-sm border border-gray-50 relative"
                  >
                    {/* Tags & Actions */}
                    <View className="flex-row justify-between w-full absolute top-3 px-3 z-10">
                      <View className="bg-[#FFF4E6] px-2 py-0.5 rounded-md self-start">
                        <Text className="text-orange-500 text-[10px] font-bold">Popular</Text>
                      </View>
                      <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Feather name="heart" size={18} color="#D1D5DB" />
                      </TouchableOpacity>
                    </View>

                    {/* Image */}
                    <Image 
                      source={{ uri: product.image || 'https://via.placeholder.com/150' }} 
                      className="w-full h-28 mt-6 mb-3 rounded-xl" 
                      resizeMode="contain" 
                    />
                    
                    {/* Details */}
                    <Text className="font-bold text-gray-900 text-sm mb-1" numberOfLines={1}>
                      {product.name || 'Double Smash Burger'}
                    </Text>
                    
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text className="text-gray-600 text-xs font-semibold ml-1 mr-2">{product.rating || '4.9'}</Text>
                      <Text className="text-gray-400 text-xs font-medium">{product.time || '25 min'}</Text>
                    </View>

                    {/* Price & Add Button */}
                    <View className="flex-row justify-between items-center mt-auto">
                      <Text className="text-gray-900 font-extrabold text-lg">${(product.price || 15.99).toFixed(2)}</Text>
                      <TouchableOpacity 
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className="bg-black w-8 h-8 rounded-full items-center justify-center"
                      >
                        <Feather name="plus" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}