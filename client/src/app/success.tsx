import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      
      {/* 1. Big Success Icon */}
      <View className="bg-orange-100 w-36 h-36 rounded-full items-center justify-center mb-8 shadow-sm">
        <Text className="text-7xl">🎉</Text>
      </View>

      {/* 2. Success Text */}
      <Text className="text-4xl font-extrabold text-gray-800 mb-3 text-center tracking-tight">
        Order Placed!
      </Text>
      <Text className="text-gray-500 text-lg text-center mb-10 px-4 leading-7">
        Your delicious food is being prepared and will be on its way to you shortly.
      </Text>

      {/* 3. Delivery Time Box */}
      <View className="bg-gray-50 w-full p-6 rounded-3xl items-center mb-12 border border-gray-100 shadow-sm">
        <Text className="text-gray-500 font-bold text-base uppercase tracking-wider mb-2">
          Estimated Delivery
        </Text>
        <Text className="text-5xl font-extrabold text-orange-500">
          25-35<Text className="text-2xl text-orange-400"> min</Text>
        </Text>
      </View>

      {/* 4. Back to Home Button */}
      <TouchableOpacity 
        // This pushes the user back to the root index.tsx (Home Screen)
        onPress={() => router.push('/')} 
        className="bg-black w-full h-16 rounded-full items-center justify-center shadow-md"
      >
        <Text className="text-white font-extrabold text-xl">Back to Home</Text>
      </TouchableOpacity>
      
    </SafeAreaView>
  );
}