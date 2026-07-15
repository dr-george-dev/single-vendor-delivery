import { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Brand } from '../constants/brand';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { PressableScale } from '../components/ui/PressableScale';

export default function SuccessScreen() {
  const router = useRouter();
  const { orderId, address } = useLocalSearchParams();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0.6)).current;
  const ring2 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ring1, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(ring1, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ring2, { toValue: 1.05, duration: 1400, useNativeDriver: true }),
          Animated.timing(ring2, { toValue: 0.7, duration: 1400, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const shortId = orderId ? String(orderId).slice(-6).toUpperCase() : '······';

  return (
    <SafeAreaView
      className="flex-1 items-center px-6"
      style={{ backgroundColor: Brand.bg }}
    >
      <View className="flex-1 w-full items-center justify-center">
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}
          className="mb-10 relative items-center justify-center"
        >
          <Animated.View
            className="absolute w-48 h-48 rounded-full border-2"
            style={{ borderColor: '#A7F3D0', transform: [{ scale: ring2 }], opacity: 0.5 }}
          />
          <Animated.View
            className="absolute w-36 h-36 rounded-full border-2"
            style={{ borderColor: '#6EE7B7', transform: [{ scale: ring1 }], opacity: 0.7 }}
          />
          <View
            className="w-24 h-24 rounded-full items-center justify-center"
            style={{
              backgroundColor: Brand.success,
              shadowColor: Brand.success,
              shadowOpacity: 0.35,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <Feather name="check" size={44} color="white" />
          </View>
        </Animated.View>

        <Text className="text-3xl font-black text-gray-900 mb-2 text-center">
          Order confirmed!
        </Text>
        <Text className="text-gray-500 text-base text-center mb-8 px-2 leading-6 font-medium">
          The kitchen is getting started. You can track your order in real time.
        </Text>

        <View
          className="bg-white w-full p-5 rounded-[28px] mb-8"
          style={{ borderWidth: 1, borderColor: Brand.border }}
        >
          <DetailRow icon="hash" label="Order ID" value={`#${shortId}`} />
          <View className="h-px bg-gray-100 my-3.5" />
          <DetailRow icon="clock" label="Estimated time" value="25–35 min" />
          <View className="h-px bg-gray-100 my-3.5" />
          <DetailRow
            icon="map-pin"
            label="Deliver to"
            value={address ? String(address) : '172 Grand St, NY'}
          />
        </View>
      </View>

      <View className="w-full pb-6">
        <PrimaryButton
          label="Track my order"
          onPress={() => router.push(`/order/${orderId}`)}
          variant="dark"
          icon={<Feather name="navigation" size={18} color="#fff" />}
          className="mb-3"
        />
        <PressableScale onPress={() => router.replace('/')} className="py-3 items-center">
          <Text className="text-gray-500 font-bold text-base">Back to home</Text>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-row items-center flex-1 mr-3">
        <View
          className="p-2 rounded-full mr-3"
          style={{ backgroundColor: Brand.bg }}
        >
          <Feather name={icon} size={15} color={Brand.muted} />
        </View>
        <Text className="text-gray-500 font-medium">{label}</Text>
      </View>
      <Text className="text-gray-900 font-extrabold text-right flex-shrink" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
