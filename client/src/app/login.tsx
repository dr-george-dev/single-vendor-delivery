import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore((state: any) => state);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return;
    const success = await login(email, password);
    if (success) router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      <View className="mb-10">
        <Text className="text-4xl font-extrabold text-gray-800 mb-2">Welcome Back</Text>
        <Text className="text-gray-500 text-lg">Sign in to place your order.</Text>
      </View>

      {error && (
        <View className="bg-red-50 p-3 rounded-xl mb-6">
          <Text className="text-red-500 font-medium text-center">{error}</Text>
        </View>
      )}

      <View className="bg-gray-100 rounded-2xl px-4 py-4 mb-4">
        <TextInput 
          placeholder="Email address" 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="text-base text-gray-800"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View className="bg-gray-100 rounded-2xl px-4 py-4 mb-8">
        <TextInput 
          placeholder="Password" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="text-base text-gray-800"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <TouchableOpacity 
        onPress={handleLogin}
        disabled={isLoading}
        className={`h-16 rounded-full items-center justify-center shadow-sm mb-4 ${isLoading ? 'bg-orange-300' : 'bg-orange-500'}`}
      >
        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-extrabold text-xl">Sign In</Text>}
      </TouchableOpacity>

      {/* Link to Registration */}
      <TouchableOpacity onPress={() => router.push('/register')} className="items-center py-4">
        <Text className="text-gray-500 text-base">
          Don't have an account? <Text className="text-orange-500 font-bold">Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}