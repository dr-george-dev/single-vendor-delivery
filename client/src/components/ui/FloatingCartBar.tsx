import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { PressableScale } from './PressableScale';
import { Brand } from '../../constants/brand';

export function FloatingCartBar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const count = items.reduce((n, i) => n + i.qty, 0);
  if (count === 0) return null;

  const subtotal = getSubtotal();

  return (
    <View
      className="absolute left-0 right-0 px-5"
      style={{ bottom: Math.max(insets.bottom, 12) + 8 }}
      pointerEvents="box-none"
    >
      <PressableScale
        onPress={() => router.push('/cart')}
        className="h-[58px] rounded-full flex-row items-center px-2"
        style={{
          backgroundColor: Brand.ink,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}
      >
        <View className="w-11 h-11 rounded-full items-center justify-center ml-1 bg-white/15">
          <Feather name="shopping-bag" size={18} color="#fff" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-white font-extrabold text-[15px]">View cart</Text>
          <Text className="text-white/60 text-xs font-medium">
            {count} {count === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <View className="bg-white rounded-full px-4 py-2.5 mr-1">
          <Text className="font-black text-[14px]" style={{ color: Brand.ink }}>
            ${subtotal.toFixed(2)}
          </Text>
        </View>
      </PressableScale>
    </View>
  );
}
