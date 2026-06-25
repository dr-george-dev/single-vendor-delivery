import { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform, Animated } from "react-native";
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

  // New State for Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Burgers");

  // Animation values
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

  // Logic to filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fa]">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-2 pb-4">
          <View className="flex-row items-center bg-white px-4 py-2 rounded-full shadow-sm">
            <Feather name="map-pin" size={16} color="#f97316" />
            <Text className="text-gray-800 font-bold ml-2 text-sm">172 Grand St, NY</Text>
          </View>
          <TouchableOpacity onPress={() => router.push(token ? '/profile' : '/login')} className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
            <Text className="text-xl font-bold text-red-600">Z</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Search Bar */}
          <View className="px-6 mb-6">
            <View className="bg-white rounded-full px-5 py-4 flex-row items-center shadow-sm border border-gray-100">
              <Feather name="search" size={20} color="#9ca3af" />
              <TextInput 
                placeholder="Search food, drinks..." 
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-base text-gray-800 ml-3 font-medium"
              />
            </View>
          </View>

          {/* Category Pills */}
          <View className="mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6">
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  onPress={() => setSelectedCategory(cat)}
                  className={`mr-4 p-3 rounded-3xl w-20 items-center ${selectedCategory === cat ? 'bg-white shadow-sm border border-orange-200' : ''}`}
                >
                  <Text className={`text-2xl mb-1`}>{cat === "Burgers" ? "🍔" : cat === "Pizza" ? "🍕" : cat === "Sides" ? "🍟" : "🥤"}</Text>
                  <Text className={`font-bold text-xs ${selectedCategory === cat ? 'text-orange-500' : 'text-gray-500'}`}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Product Grid */}
          <View className="px-6 pb-24">
            {loading ? <ActivityIndicator size="large" color="#f97316" /> : (
              <View className="flex-row flex-wrap justify-between">
                {filteredProducts.map((product: any) => (
                  <TouchableOpacity key={product._id} onPress={() => router.push(`/product/${product._id}`)} className="bg-white p-4 rounded-[28px] w-[48%] mb-4 shadow-sm">
                    <Image source={{ uri: product.image }} className="w-full h-28 mb-3" resizeMode="contain" />
                    <Text className="font-bold text-gray-800" numberOfLines={1}>{product.name}</Text>
                    <Text className="text-orange-500 font-extrabold text-lg mt-1">${product.price.toFixed(2)}</Text>
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