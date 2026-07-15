import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { API_BASE_URL } from '../../config/api';
import { Brand } from '../../constants/brand';
import { Badge } from '../../components/ui/Badge';
import { IconButton } from '../../components/ui/IconButton';
import { QuantityStepper } from '../../components/ui/QuantityStepper';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { PressableScale } from '../../components/ui/PressableScale';

const API_URL = `${API_BASE_URL}/api/products`;

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const addItem = useCartStore((state: any) => state.addItem);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  const imageScale = useRef(new Animated.Value(0.85)).current;
  const contentSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
        Animated.parallel([
          Animated.spring(imageScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
          Animated.spring(contentSlide, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
        ]).start();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => {
      router.push('/cart');
    }, 280);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: Brand.bg }}>
        <ActivityIndicator size="large" color={Brand.accent} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 justify-center items-center px-8" style={{ backgroundColor: Brand.bg }}>
        <Feather name="alert-circle" size={40} color={Brand.danger} />
        <Text className="text-gray-900 font-bold text-lg mt-4 mb-2">Something went wrong</Text>
        <Text className="text-gray-500 text-center mb-6">{error || 'Product not found'}</Text>
        <PrimaryButton label="Go back" onPress={() => router.back()} variant="dark" className="px-10" />
      </View>
    );
  }

  const hasOriginal = !!product.originalPrice && product.originalPrice > product.price;
  const originalPrice = hasOriginal
    ? product.originalPrice
    : Number((product.price * 1.25).toFixed(2));
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const lineTotal = product.price * quantity;
  const tag = product.tags?.[0] || product.category || 'Popular';

  return (
    <View className="flex-1" style={{ backgroundColor: Brand.bg, paddingTop: insets.top }}>
      {/* Floating header */}
      <View
        className="px-5 py-2 flex-row justify-between items-center absolute w-full z-20"
        style={{ top: insets.top }}
      >
        <IconButton name="chevron-down" onPress={() => router.back()} />
        <PressableScale
          onPress={() => setLiked(!liked)}
          scaleTo={0.9}
          className="w-11 h-11 rounded-full items-center justify-center bg-white"
          style={{ borderWidth: 1, borderColor: Brand.border }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? Brand.danger : Brand.ink}
          />
        </PressableScale>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces>
        <Animated.View
          className="w-full h-80 items-center justify-center"
          style={{ transform: [{ scale: imageScale }] }}
        >
          <View className="absolute w-64 h-64 rounded-full bg-white/60" />
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/400' }}
            className="w-[88%] h-[88%]"
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          className="px-6 bg-white rounded-t-[36px] pt-7 pb-36"
          style={{
            transform: [{ translateY: contentSlide }],
            borderTopWidth: 1,
            borderColor: Brand.border,
            minHeight: 420,
          }}
        >
          <View className="w-10 h-1 rounded-full bg-gray-200 self-center mb-5" />

          <View className="flex-row items-center justify-between mb-3">
            <Badge label={tag} tone="warning" />
            <View className="flex-row items-center bg-amber-50 px-2.5 py-1 rounded-full">
              <Ionicons name="star" size={13} color={Brand.star} />
              <Text className="font-extrabold text-amber-700 text-xs ml-1">
                {(product.rating ?? 4.9).toFixed(1)}
              </Text>
            </View>
          </View>

          <Text className="text-[28px] font-black text-gray-900 mb-2 leading-tight">
            {product.name}
          </Text>

          <View className="flex-row items-center mb-6">
            <Text className="text-[26px] font-black mr-3" style={{ color: Brand.accent }}>
              ${Number(product.price).toFixed(2)}
            </Text>
            <Text className="text-base font-bold text-gray-400 line-through mr-2">
              ${Number(originalPrice).toFixed(2)}
            </Text>
            <View className="bg-red-50 px-2 py-0.5 rounded-md">
              <Text className="text-red-500 font-bold text-[11px]">{discount}% off</Text>
            </View>
          </View>

          {/* Metrics */}
          <View
            className="flex-row mb-7 rounded-2xl overflow-hidden"
            style={{ backgroundColor: Brand.bg, borderWidth: 1, borderColor: Brand.border }}
          >
            <Metric
              icon={<Ionicons name="star" size={18} color={Brand.star} />}
              value={(product.rating ?? 4.9).toFixed(1)}
              label="Rating"
            />
            <View className="w-px bg-gray-200 my-3" />
            <Metric
              icon={<Feather name="clock" size={18} color={Brand.ink} />}
              value={`${product.prepTime ?? 25}`}
              label="Min"
            />
            <View className="w-px bg-gray-200 my-3" />
            <Metric
              icon={<Feather name="zap" size={18} color={Brand.accent} />}
              value={`${product.calories ?? '—'}`}
              label="Kcal"
            />
          </View>

          <Text className="text-base font-extrabold text-gray-900 mb-2">About this dish</Text>
          <Text className="text-gray-500 leading-6 text-[15px] mb-6">
            {product.description ||
              'Freshly prepared with premium ingredients. Made to order and delivered hot.'}
          </Text>

          {/* Quick extras (visual only for premium feel) */}
          <Text className="text-base font-extrabold text-gray-900 mb-3">Popular add-ons</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {['Extra cheese', 'No onions', 'Spicy sauce'].map((addon) => (
              <PressableScale
                key={addon}
                scaleTo={0.95}
                className="px-3.5 py-2.5 rounded-full bg-white"
                style={{ borderWidth: 1, borderColor: Brand.border }}
              >
                <Text className="text-sm font-semibold text-gray-700">+ {addon}</Text>
              </PressableScale>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Sticky footer */}
      <View
        className="absolute bottom-0 w-full bg-white px-5 pt-4 flex-row items-center border-t"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          borderColor: Brand.border,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
        }}
      >
        <QuantityStepper
          value={quantity}
          onIncrement={() => setQuantity((q) => q + 1)}
          onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
        />
        <View className="flex-1 ml-3">
          <PrimaryButton
            label={added ? 'Added!' : 'Add to cart'}
            rightLabel={`$${lineTotal.toFixed(2)}`}
            onPress={handleAddToCart}
            variant={added ? 'dark' : 'primary'}
          />
        </View>
      </View>
    </View>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View className="flex-1 items-center py-4">
      <View className="mb-1.5">{icon}</View>
      <Text className="text-base font-black text-gray-900">{value}</Text>
      <Text className="text-gray-400 text-[11px] font-medium mt-0.5">{label}</Text>
    </View>
  );
}
