import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { Brand } from '../constants/brand';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { PressableScale } from '../components/ui/PressableScale';
import { IconButton } from '../components/ui/IconButton';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore((state: any) => state);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    const success = await login(email, password);
    if (success) router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Brand.bg }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="pt-2 mb-8">
            <IconButton name="chevron-left" onPress={() => router.back()} />
          </View>

          <View
            className="w-14 h-14 rounded-2xl items-center justify-center mb-6"
            style={{ backgroundColor: Brand.accentSoft }}
          >
            <Text className="text-2xl">🍔</Text>
          </View>

          <Text className="text-[32px] font-black text-gray-900 mb-2">Welcome back</Text>
          <Text className="text-gray-500 text-base mb-8 leading-6">
            Sign in to track orders and checkout faster.
          </Text>

          {error ? (
            <View
              className="p-3.5 rounded-2xl mb-5 flex-row items-center"
              style={{ backgroundColor: Brand.dangerSoft }}
            >
              <Feather name="alert-circle" size={16} color={Brand.danger} />
              <Text className="text-red-600 font-medium text-sm ml-2 flex-1">{error}</Text>
            </View>
          ) : null}

          <Field
            icon="mail"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Field
            icon="lock"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            right={
              <PressableScale onPress={() => setShowPassword((s) => !s)} scaleTo={0.9}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={Brand.mutedLight} />
              </PressableScale>
            }
          />

          <PrimaryButton
            label="Sign in"
            onPress={handleLogin}
            loading={isLoading}
            className="mt-2 mb-6"
          />

          <PressableScale onPress={() => router.push('/register')} className="items-center py-3">
            <Text className="text-gray-500 text-[15px]">
              New here?{' '}
              <Text className="font-extrabold" style={{ color: Brand.accent }}>
                Create account
              </Text>
            </Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  icon,
  right,
  ...props
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  right?: React.ReactNode;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View
      className="bg-white rounded-2xl px-4 py-3.5 mb-3.5 flex-row items-center"
      style={{ borderWidth: 1, borderColor: Brand.border }}
    >
      <Feather name={icon} size={18} color={Brand.mutedLight} />
      <TextInput
        className="flex-1 text-[15px] text-gray-800 ml-3 font-medium"
        placeholderTextColor={Brand.mutedLight}
        {...props}
      />
      {right}
    </View>
  );
}
