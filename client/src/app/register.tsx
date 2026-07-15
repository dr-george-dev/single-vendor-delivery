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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore((state: any) => state);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return;
    const success = await register(name, email, password);
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
            <Text className="text-2xl">✨</Text>
          </View>

          <Text className="text-[32px] font-black text-gray-900 mb-2">Create account</Text>
          <Text className="text-gray-500 text-base mb-8 leading-6">
            Join to order your favorites in a few taps.
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

          <Field icon="user" placeholder="Full name" value={name} onChangeText={setName} />
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
            placeholder="Password (min 6 characters)"
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
            label="Sign up"
            onPress={handleRegister}
            loading={isLoading}
            className="mt-2 mb-6"
          />

          <PressableScale onPress={() => router.push('/login')} className="items-center py-3">
            <Text className="text-gray-500 text-[15px]">
              Already have an account?{' '}
              <Text className="font-extrabold" style={{ color: Brand.accent }}>
                Sign in
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
