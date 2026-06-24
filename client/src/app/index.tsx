import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy data to structure our UI before connecting to the MongoDB backend
const categories = ["Burgers", "Pizza", "Sides", "Combos", "Drinks"];
const dummyProducts = [
  { 
    id: "1", 
    name: "Classic Cheeseburger", 
    price: 8.99, 
    rating: 4.8, 
    // Using a placeholder image for now
    image: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
  },
  { 
    id: "2", 
    name: "Pepperoni Pizza", 
    price: 12.99, 
    rating: 4.9, 
    image: "https://cdn-icons-png.flaticon.com/512/3595/3595458.png" 
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 1. Header Section */}
      <View className="flex-row justify-between items-center px-6 pt-4">
        <Text className="text-3xl font-bold text-gray-800">
          What would you{"\n"}like to order?
        </Text>
        {/* Placeholder for user profile pic */}
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
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="pl-6"
          contentContainerStyle={{ paddingRight: 40 }} // Ensures last item isn't cut off
        >
          {categories.map((cat, index) => (
            <TouchableOpacity 
              key={index} 
              // Highlighting the first category as "active" for now
              className={`${index === 0 ? 'bg-orange-500' : 'bg-gray-100'} px-6 py-3 rounded-full mr-3 shadow-sm`}
            >
              <Text className={`${index === 0 ? 'text-white' : 'text-gray-600'} font-bold text-base`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4. Popular Items List */}
      <View className="flex-1 px-6 mt-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">Popular Items</Text>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {dummyProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              className="bg-gray-50 p-4 rounded-3xl mb-4 flex-row items-center shadow-sm"
              // This is where Expo Router shines! It automatically navigates to app/product/[id].tsx
              onPress={() => router.push(`/product/${product.id}`)}
            >
              <Image 
                source={{ uri: product.image }} 
                className="w-20 h-20 rounded-2xl mr-4 bg-white" 
                resizeMode="contain"
              />
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800">{product.name}</Text>
                <View className="flex-row items-center mt-1 mb-2">
                  <Text className="text-yellow-500 mr-1 text-xs">⭐</Text>
                  <Text className="text-gray-500 font-medium">{product.rating}</Text>
                </View>
                <Text className="text-orange-500 font-extrabold text-lg">${product.price}</Text>
              </View>
              
              {/* Quick Add Button */}
              <View className="bg-black p-3 rounded-full">
                <Text className="text-white font-bold text-lg leading-none">+</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}