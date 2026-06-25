import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from "../store/authStore";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore((state: any) => state);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace('/');
        }
      }
    ]);
  };

  // Failsafe: if somehow reached without being logged in
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-[#f8f9fa] justify-center items-center">
        <Text>Please log in.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fa]">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100">
          <Feather name="chevron-left" size={24} color="#1a1c1e" />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold text-gray-900">Profile</Text>
        <View className="w-12 h-12" /> 
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm">
            <Text className="text-4xl font-bold text-orange-500">
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-2xl font-extrabold text-gray-900">{user.name}</Text>
          <Text className="text-gray-500 font-medium">{user.email}</Text>
          <View className="bg-[#1a1c1e] px-3 py-1 rounded-full mt-3">
            <Text className="text-white font-bold text-xs uppercase">{user.role}</Text>
          </View>
        </View>

        {/* Menu Options */}
        <View className="bg-white rounded-[28px] p-2 shadow-sm border border-gray-100 mb-6">
          <TouchableOpacity onPress={() => router.push('/orders')} className="flex-row items-center p-4 border-b border-gray-50">
            <View className="bg-gray-50 w-10 h-10 rounded-full items-center justify-center mr-4">
              <Feather name="shopping-bag" size={20} color="#1a1c1e" />
            </View>
            <Text className="flex-1 text-base font-bold text-gray-800">My Orders</Text>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50">
            <View className="bg-gray-50 w-10 h-10 rounded-full items-center justify-center mr-4">
              <Feather name="map-pin" size={20} color="#1a1c1e" />
            </View>
            <Text className="flex-1 text-base font-bold text-gray-800">Saved Addresses</Text>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50">
            <View className="bg-gray-50 w-10 h-10 rounded-full items-center justify-center mr-4">
              <Feather name="credit-card" size={20} color="#1a1c1e" />
            </View>
            <Text className="flex-1 text-base font-bold text-gray-800">Payment Methods</Text>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center p-4">
            <View className="bg-gray-50 w-10 h-10 rounded-full items-center justify-center mr-4">
              <Feather name="settings" size={20} color="#1a1c1e" />
            </View>
            <Text className="flex-1 text-base font-bold text-gray-800">Settings</Text>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-50 py-4 rounded-full flex-row justify-center items-center mb-10"
        >
          <Feather name="log-out" size={20} color="#ef4444" className="mr-2" />
          <Text className="text-red-500 font-extrabold text-base">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}