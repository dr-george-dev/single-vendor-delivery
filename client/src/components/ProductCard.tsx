import { Image, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PressableScale } from './ui/PressableScale';
import { useCartStore } from '../store/cartStore';
import { Brand } from '../constants/brand';

type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  rating?: number;
  prepTime?: number;
  tags?: string[];
  originalPrice?: number;
};

type Props = {
  product: Product;
  width?: `${number}%` | number;
};

export function ProductCard({ product, width = '48%' }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const image = product.image || 'https://via.placeholder.com/600x400';

  return (
    <PressableScale
      onPress={() => router.push(`/product/${product._id}`)}
      className="mb-6"
      style={{ width }}
    >
      <View className="overflow-hidden rounded-[20px]">
        {/* Image Container */}
        <View className="relative h-56 bg-gray-200 overflow-hidden">
          <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />

          {/* Top Badge */}
          <View className="absolute top-3 left-3 z-20">
            <View
              className="px-3 py-1.5 rounded-full flex-row items-center gap-1"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)' }}
            >
              <Text className="text-white text-[11px] font-bold">⭐ Popular</Text>
            </View>
          </View>

          {/* Right Button - Wishlist */}
          <View className="absolute top-3 right-3 z-20">
            <PressableScale
              scaleTo={0.85}
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
            >
              <Feather name="heart" size={16} color={Brand.accent} strokeWidth={2} />
            </PressableScale>
          </View>

          {/* Dark Overlay */}
          <View className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </View>

        {/* Info Card - Floating Style */}
        <View
          className="px-4 py-3.5 rounded-b-[20px]"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Name and Rating Row */}
          <View className="flex-row justify-between items-start mb-2.5">
            <Text className="flex-1 font-bold text-gray-900 text-[15px] pr-2" numberOfLines={2}>
              {product.name}
            </Text>
            <View
              className="flex-row items-center gap-1 px-2 py-1 rounded-lg"
              style={{ backgroundColor: 'rgba(252, 211, 77, 0.1)' }}
            >
              <Ionicons name="star" size={12} color="#FCD34D" />
              <Text className="text-gray-700 text-[11px] font-bold">
                {(product.rating ?? 4.8).toFixed(1)}
              </Text>
            </View>
          </View>

          {/* Prep Time */}
          <View className="flex-row items-center gap-1 mb-3">
            <Feather name="clock" size={12} color={Brand.mutedLight} />
            <Text className="text-gray-500 text-[12px] font-medium">
              {product.prepTime ?? 25} min
            </Text>
          </View>

          {/* Price and Add Button Row */}
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-amber-500 font-black text-[20px]">
                ${Number(product.price).toFixed(2)}
              </Text>
              {product.originalPrice && (
                <Text className="text-gray-400 text-[11px] line-through font-medium">
                  ${Number(product.originalPrice).toFixed(2)}
                </Text>
              )}
            </View>

            {/* Premium Add Button */}
            <PressableScale
              onPress={() => addItem({ ...product, image }, 1)}
              scaleTo={0.92}
              className="w-12 h-12 rounded-full items-center justify-center flex-row"
              style={{
                backgroundColor: Brand.accent,
                shadowColor: Brand.accent,
                shadowOpacity: 0.35,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 5,
              }}
            >
              <Feather name="plus" size={22} color="white" strokeWidth={3} />
            </PressableScale>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}