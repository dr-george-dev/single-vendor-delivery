import { useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { Brand } from '../constants/brand';
import { IconButton } from '../components/ui/IconButton';
import { PressableScale } from '../components/ui/PressableScale';
import { PrimaryButton } from '../components/ui/PrimaryButton';

type MenuItem = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  route: string | null;
  adminOnly?: boolean;
};

const MENU: MenuItem[] = [
  { icon: 'shopping-bag', label: 'My orders', route: '/orders' },
  {
    icon: 'monitor',
    label: 'Kitchen board',
    route: '/kitchen',
    adminOnly: true,
  },
  { icon: 'map-pin', label: 'Saved addresses', route: null },
  { icon: 'credit-card', label: 'Payment methods', route: null },
  { icon: 'bell', label: 'Notifications', route: null },
  { icon: 'settings', label: 'Settings', route: null },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore((state: any) => state);
  const isAdmin = user?.role === 'admin';
  const visibleMenu = MENU.filter((item) => !item.adminOnly || isAdmin);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: Brand.bg }}>
        <Text className="text-gray-500">Please log in.</Text>
      </SafeAreaView>
    );
  }

  const initial = user.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Brand.bg }} edges={['top']}>
      <View className="px-5 py-3 flex-row items-center justify-between">
        <IconButton name="chevron-left" onPress={() => router.back()} />
        <Text className="text-lg font-black text-gray-900">Profile</Text>
        <View className="w-11" />
      </View>

      <ScrollView
        className="flex-1 px-5 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Avatar card */}
        <View
          className="items-center mb-6 bg-white rounded-[28px] py-8 px-5"
          style={{ borderWidth: 1, borderColor: Brand.border }}
        >
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{
              backgroundColor: Brand.accentSoft,
              borderWidth: 3,
              borderColor: '#fff',
              shadowColor: Brand.accent,
              shadowOpacity: 0.15,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text className="text-4xl font-black" style={{ color: Brand.accent }}>
              {initial}
            </Text>
          </View>
          <Text className="text-2xl font-black text-gray-900">{user.name}</Text>
          <Text className="text-gray-500 font-medium mt-1">{user.email}</Text>
          <View
            className="px-3 py-1 rounded-full mt-3"
            style={{ backgroundColor: Brand.ink }}
          >
            <Text className="text-white font-bold text-[10px] uppercase tracking-wider">
              {user.role}
            </Text>
          </View>
        </View>

        {/* Kitchen CTA for admins */}
        {isAdmin && (
          <PressableScale onPress={() => router.push('/kitchen')} className="mb-5">
            <View
              className="rounded-[24px] p-5 flex-row items-center"
              style={{ backgroundColor: Brand.ink }}
            >
              <View className="w-12 h-12 rounded-2xl bg-white/15 items-center justify-center mr-4">
                <Feather name="monitor" size={22} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-black text-base">Open kitchen board</Text>
                <Text className="text-white/60 text-xs font-medium mt-0.5">
                  Live orders · advance status · auto-refresh
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color="#fff" />
            </View>
          </PressableScale>
        )}

        {/* Menu */}
        <View
          className="bg-white rounded-[28px] overflow-hidden mb-5"
          style={{ borderWidth: 1, borderColor: Brand.border }}
        >
          {visibleMenu.map((item, index) => (
            <PressableScale
              key={item.label}
              onPress={() => {
                if (item.route) router.push(item.route as any);
                else Alert.alert('Coming soon', `${item.label} will be available soon.`);
              }}
            >
              <View
                className="flex-row items-center px-4 py-4"
                style={{
                  borderBottomWidth: index < visibleMenu.length - 1 ? 1 : 0,
                  borderBottomColor: '#F3F4F6',
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3.5"
                  style={{
                    backgroundColor: item.adminOnly ? Brand.accentSoft : Brand.bg,
                  }}
                >
                  <Feather
                    name={item.icon}
                    size={18}
                    color={item.adminOnly ? Brand.accent : Brand.ink}
                  />
                </View>
                <Text className="flex-1 text-[15px] font-bold text-gray-800">{item.label}</Text>
                <Feather name="chevron-right" size={18} color={Brand.mutedLight} />
              </View>
            </PressableScale>
          ))}
        </View>

        <PrimaryButton
          label="Log out"
          onPress={handleLogout}
          variant="danger"
          icon={<Feather name="log-out" size={18} color={Brand.danger} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
