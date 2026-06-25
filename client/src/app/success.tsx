import { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from '@expo/vector-icons';

export default function SuccessScreen() {
  const router = useRouter();
  
  // Animation for the checkmark to pop in
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#f4f2ee] items-center px-6 pt-20">
      
      {/* Animated Success Checkmark */}
      <Animated.View 
        style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}
        className="mb-10 relative items-center justify-center"
      >
        {/* Outer decorative circles */}
        <View className="absolute w-48 h-48 rounded-full border border-green-200" />
        <View className="absolute w-36 h-36 rounded-full border border-green-300" />
        
        {/* Main Checkmark circle */}
        <View className="bg-[#10b981] w-24 h-24 rounded-full items-center justify-center shadow-lg shadow-green-200">
          <Feather name="check" size={48} color="white" />
        </View>
      </Animated.View>

      <Text className="text-3xl font-extrabold text-gray-900 mb-3 text-center">
        Payment Successful!
      </Text>
      <Text className="text-gray-500 text-base text-center mb-10 px-4 leading-6 font-medium">
        Your order has been placed and is being prepared with love.
      </Text>

      {/* Order Details Card */}
      <View className="bg-white w-full p-6 rounded-3xl mb-12 shadow-sm border border-gray-100">
        <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-4">
          <View className="flex-row items-center">
            <View className="bg-gray-100 p-2 rounded-full mr-3">
              <Feather name="hash" size={16} color="#6b7280" />
            </View>
            <Text className="text-gray-500 font-medium">Order ID</Text>
          </View>
          <Text className="text-gray-900 font-bold">#FD-2847</Text>
        </View>

        <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-4">
          <View className="flex-row items-center">
            <View className="bg-gray-100 p-2 rounded-full mr-3">
              <Feather name="clock" size={16} color="#6b7280" />
            </View>
            <Text className="text-gray-500 font-medium">Estimated time</Text>
          </View>
          <Text className="text-gray-900 font-bold">25-35 min</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="bg-gray-100 p-2 rounded-full mr-3">
              <Feather name="map-pin" size={16} color="#6b7280" />
            </View>
            <Text className="text-gray-500 font-medium">Deliver to</Text>
          </View>
          <Text className="text-gray-900 font-bold">172 Grand St, NY</Text>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity className="bg-[#1a1c1e] w-full h-16 rounded-full items-center justify-center flex-row shadow-md mb-4">
        <Feather name="navigation" size={20} color="white" className="mr-2" />
        <Text className="text-white font-extrabold text-lg ml-2">Track my order</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/')} className="py-4">
        <Text className="text-gray-500 font-bold text-base">Back to home</Text>
      </TouchableOpacity>
      
    </SafeAreaView>
  );
}