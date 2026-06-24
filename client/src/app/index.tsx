import { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = ["Burgers", "Pizza", "Sides", "Combos", "Drinks"];

// 🚨 IMPORTANT FIX FOR EXPO GO (PHYSICAL PHONE) 🚨
// Because you are using a physical phone, localhost and 10.0.2.2 will NOT work.
// Your phone needs your computer's actual Wi-Fi IP address.
// 1. Find your IPv4 address using `ipconfig` in your terminal.
// 2. Replace "192.168.x.x" below with your actual IP address.
const API_URL = "http://192.168.1.9:5000/api/products";

export default function HomeScreen() {
  const router = useRouter();
  
  // State variables to handle our API data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products when the screen loads
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error("Failed to fetch products from server");
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 1. Header Section */}
      <View className="flex-row justify-between items-center px-6 pt-4">
        <Text className="text-3xl font-bold text-gray-800">
          What would you{"\n"}like to order?
        </Text>
        <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center">
          <Text className="text-xl">👤</Text>
        </View>
      </View>

      {/* 2. Search Bar */}
      <View className="px-6 mt-6">
        <View className="bg-gray-100 rounded-2xl px-4 py-3 flex-row items-center">
          <Text className="text-gray-400 mr-2 text-lg">🔍</Text>
          <TextInput 
            placeholder="Search for food..." 
            className="flex-1 text-base text-gray-800"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* 3. Category Pills */}
      <View className="mt-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6" contentContainerStyle={{ paddingRight: 40 }}>
          {categories.map((cat, index) => (
            <TouchableOpacity key={index} className={`${index === 0 ? 'bg-orange-500' : 'bg-gray-100'} px-6 py-3 rounded-full mr-3 shadow-sm`}>
              <Text className={`${index === 0 ? 'text-white' : 'text-gray-600'} font-bold text-base`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4. Popular Items List (Now Dynamic!) */}
      <View className="flex-1 px-6 mt-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">Popular Items</Text>
        
        {/* State 1: Loading API */}
        {loading ? (
          <View className="flex-1 justify-center items-center pt-10">
            <ActivityIndicator size="large" color="#f97316" />
            <Text className="text-gray-500 mt-4 font-medium">Loading fresh food...</Text>
          </View>
          
        // State 2: API Error
        ) : error ? (
          <View className="flex-1 justify-center items-center pt-10">
            <Text className="text-red-500 font-bold mb-2">Oops! Cannot connect to server.</Text>
            <Text className="text-gray-500 text-center mb-6 text-sm px-4">{error}</Text>
            <TouchableOpacity onPress={fetchProducts} className="bg-orange-500 px-8 py-3 rounded-full shadow-sm">
              <Text className="text-white font-bold text-base">Try Again</Text>
            </TouchableOpacity>
          </View>

        // State 3: API Success (Empty Database)
        ) : products.length === 0 ? (
           <View className="flex-1 justify-center items-center pt-10">
            <Text className="text-gray-400 text-lg">No products found in database yet.</Text>
          </View>
          
        // State 4: API Success (Products Loaded)
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {products.map((product: any) => (
              <TouchableOpacity
                key={product._id} // MongoDB uses _id!
                className="bg-gray-50 p-4 rounded-3xl mb-4 flex-row items-center shadow-sm"
                onPress={() => router.push(`/product/${product._id}`)}
              >
                <Image source={{ uri: product.image }} className="w-20 h-20 rounded-2xl mr-4 bg-white" resizeMode="contain" />
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">{product.name}</Text>
                  <View className="flex-row items-center mt-1 mb-2">
                    <Text className="text-yellow-500 mr-1 text-xs">⭐</Text>
                    <Text className="text-gray-500 font-medium">{product.rating}</Text>
                  </View>
                  <Text className="text-orange-500 font-extrabold text-lg">${product.price.toFixed(2)}</Text>
                </View>
                
                <View className="bg-black p-3 rounded-full">
                  <Text className="text-white font-bold text-lg leading-none">+</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}