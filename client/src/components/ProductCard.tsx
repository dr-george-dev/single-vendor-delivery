import { Image, Text, View } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PressableScale } from './ui/PressableScale';
import { Badge } from './ui/Badge';
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
  const tag = product.tags?.[0] || 'Popular';

  return (
    <PressableScale
      onPress={() => router.push(`/product/${product._id}`)}
      className="mb-4"
      style={{ width }}
    >
      <View
        className="bg-white p-3 rounded-[24px] overflow-hidden"
        style={{
          borderWidth: 1,
          borderColor: Brand.border,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        }}
      >
        <View className="flex-row justify-between items-start absolute top-3 left-3 right-3 z-10">
          <Badge label={tag} tone="warning" />
          <PressableScale scaleTo={0.85} className="w-8 h-8 rounded-full bg-white/90 items-center justify-center">
            <Feather name="heart" size={15} color={Brand.mutedLight} />
          </PressableScale>
        </View>

        <View className="bg-[#F8F6F3] rounded-2xl mt-1 mb-3 h-28 items-center justify-center overflow-hidden">
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/150' }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        <Text className="font-bold text-gray-900 text-[13px] mb-1.5" numberOfLines={1}>
          {product.name}
        </Text>

        <View className="flex-row items-center mb-3">
          <Ionicons name="star" size={11} color={Brand.star} />
          <Text className="text-gray-700 text-[11px] font-bold ml-1">
            {(product.rating ?? 4.9).toFixed(1)}
          </Text>
          <View className="w-1 h-1 rounded-full bg-gray-300 mx-1.5" />
          <Text className="text-gray-400 text-[11px] font-medium">
            {product.prepTime ?? 25} min
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-gray-900 font-black text-[16px]">
              ${Number(product.price).toFixed(2)}
            </Text>
            {product.originalPrice ? (
              <Text className="text-gray-400 text-[11px] line-through font-medium">
                ${Number(product.originalPrice).toFixed(2)}
              </Text>
            ) : null}
          </View>
          <PressableScale
            onPress={() =>
              addItem(
                {
                  ...product,
                  image: product.image || 'https://via.placeholder.com/150',
                },
                1
              )
            }
            scaleTo={0.88}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: Brand.ink }}
          >
            <Feather name="plus" size={16} color="#fff" />
          </PressableScale>
        </View>
      </View>
    </PressableScale>
  );
}
