import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuthStore } from "../store/authStore";

const API_URL = Platform.OS === 'android' 
  ? "http://10.0.2.2:5000/api/products" 
  : "http://192.168.1.9:5000/api/products"; // Replace with your IP!

const categories = [
  { name: "Burgers", icon: "🍔", active: true },
  { name: "Pizza", icon: "🍕", active: false },
  { name: "Sides", icon: "🍟", active: false },
  { name: "Combos", icon: "🍱", active: false },
  { name: "Drinks", icon: "🥤", active: false },
];

export default function HomeScreen() {
  const router = useRouter();
  const { token } = useAuthStore((state: any) => state);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchProducts();
    // Trigger entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fa]">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Header Section */}
        <View className="flex-row justify-between items-center px-6 pt-2 pb-4">
          <View className="flex-row items-center bg-white px-4 py-2 rounded-full shadow-sm">
            <Feather name="map-pin" size={16} color="#f97316" />
            <Text className="text-gray-800 font-bold ml-2 mr-1 text-sm">172 Grand St, NY</Text>
            <Feather name="chevron-down" size={16} color="#4b5563" />
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push(token ? '/orders' : '/login')}
            className="w-12 h-12 bg-red-100 rounded-full items-center justify-center border-2 border-white shadow-sm relative"
          >
            <Text className="text-xl font-bold text-red-600">Z</Text>
            <View className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
          </TouchableOpacity>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Search Bar */}
          <View className="px-6 mb-6 mt-2">
            <View className="bg-white rounded-full px-5 py-4 flex-row items-center shadow-sm border border-gray-100">
              <Feather name="search" size={20} color="#9ca3af" />
              <TextInput 
                placeholder="Search food, drinks, more..." 
                className="flex-1 text-base text-gray-800 ml-3 font-medium"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Category Pills */}
          <View className="mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6" contentContainerStyle={{ paddingRight: 40 }}>
              {categories.map((cat, index) => (
                <TouchableOpacity key={index} className={`items-center justify-center mr-4 p-3 rounded-3xl w-20 ${cat.active ? 'bg-white shadow-sm border border-gray-100' : ''}`}>
                  <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mb-2">
                    <Text className="text-2xl">{cat.icon}</Text>
                  </View>
                  <Text className={`font-bold text-xs ${cat.active ? 'text-orange-500' : 'text-gray-500'}`}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Hero Banner */}
          <View className="px-6 mb-8">
            <View className="bg-[#1a1c1e] rounded-[32px] p-6 overflow-hidden relative">
              <View className="w-2/3 z-10">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="sparkles" size={14} color="#f97316" />
                  <Text className="text-gray-300 text-xs font-bold ml-1 uppercase tracking-wider">First Order</Text>
                </View>
                <Text className="text-white text-2xl font-extrabold mb-1">Free delivery on</Text>
                <Text className="text-white text-2xl font-extrabold mb-2">your first order</Text>
                <Text className="text-gray-400 text-xs mb-4">No code needed, ends tonight</Text>
                
                <TouchableOpacity className="bg-white px-5 py-2.5 rounded-full self-start flex-row items-center">
                  <Text className="font-bold text-gray-900 mr-2">Order now</Text>
                  <Feather name="arrow-right" size={16} color="#111827" />
                </TouchableOpacity>
              </View>
              {/* Fake Background Image for Banner */}
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' }} 
                className="absolute -right-10 -bottom-10 w-48 h-48 opacity-50"
              />
            </View>
          </View>

          {/* Popular Items Grid */}
          <View className="px-6 pb-24">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-extrabold text-gray-900">Popular now</Text>
              <TouchableOpacity>
                <Text className="text-orange-500 font-bold text-sm">See all</Text>
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <ActivityIndicator size="large" color="#f97316" className="mt-10" />
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {products.map((product: any) => (
                  <TouchableOpacity
                    key={product._id}
                    onPress={() => router.push(`/product/${product._id}`)}
                    className="bg-white p-4 rounded-[28px] w-[48%] mb-4 shadow-sm border border-gray-100"
                  >
                    <View className="absolute top-4 right-4 z-10 bg-white/80 p-1.5 rounded-full">
                      <Ionicons name="heart-outline" size={18} color="#4b5563" />
                    </View>
                    
                    <Image source={{ uri: product.image }} className="w-full h-28 mb-3" resizeMode="contain" />
                    
                    <Text className="font-bold text-gray-800 text-base leading-tight mb-1" numberOfLines={2}>
                      {product.name}
                    </Text>
                    
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text className="text-gray-500 text-xs font-bold ml-1">{product.rating} • {product.prepTime} min</Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-auto">
                      <Text className="text-gray-900 font-extrabold text-lg">${product.price.toFixed(2)}</Text>
                      <View className="bg-[#1a1c1e] w-8 h-8 rounded-full items-center justify-center">
                        <Feather name="plus" size={16} color="white" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Bottom Nav (UI Only) */}
      <View className="absolute bottom-6 left-6 right-6 bg-white rounded-full py-4 px-8 flex-row justify-between items-center shadow-lg border border-gray-100">
        <TouchableOpacity className="items-center">
          <Feather name="home" size={24} color="#f97316" />
          <View className="w-1 h-1 bg-orange-500 rounded-full mt-1" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center opacity-40">
          <Feather name="search" size={24} color="#1a1c1e" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/cart')} className="items-center opacity-40">
          <Feather name="shopping-bag" size={24} color="#1a1c1e" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(token ? '/orders' : '/login')} className="items-center opacity-40">
          <Feather name="user" size={24} color="#1a1c1e" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}