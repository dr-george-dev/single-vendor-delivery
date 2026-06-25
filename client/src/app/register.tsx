import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore((state: any) => state);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) return;
    const success = await register(name, email, password);
    if (success) router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mb-6">
        <Text className="text-xl">←</Text>
      </TouchableOpacity>

      <View className="mb-10">
        <Text className="text-4xl font-extrabold text-gray-800 mb-2">Create Account</Text>
        <Text className="text-gray-500 text-lg">Join us to start ordering delicious food.</Text>
      </View>

      {error && (
        <View className="bg-red-50 p-3 rounded-xl mb-6">
          <Text className="text-red-500 font-medium text-center">{error}</Text>
        </View>
      )}

      <View className="bg-gray-100 rounded-2xl px-4 py-4 mb-4">
        <TextInput 
          placeholder="Full Name" 
          value={name}
          onChangeText={setName}
          className="text-base text-gray-800"
          placeholderTextColor="#9ca3af"
        />
      </View>

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
          placeholder="Password (min 6 characters)" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="text-base text-gray-800"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <TouchableOpacity 
        onPress={handleRegister}
        disabled={isLoading}
        className={`h-16 rounded-full items-center justify-center shadow-sm ${isLoading ? 'bg-orange-300' : 'bg-orange-500'}`}
      >
        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-extrabold text-xl">Sign Up</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}