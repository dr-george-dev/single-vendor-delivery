import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/api';
import { Brand, CATEGORY_META } from '../constants/brand';
import { ProductCard } from '../components/ProductCard';
import { FloatingCartBar } from '../components/ui/FloatingCartBar';
import { PressableScale } from '../components/ui/PressableScale';
import { EmptyState } from '../components/ui/EmptyState';

const API_URL = `${API_BASE_URL}/api/products`;
const categories = Object.keys(CATEGORY_META);

export default function HomeScreen() {
  const router = useRouter();
  const { token, user } = useAuthStore((state: any) => state);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Burgers');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    fetchProducts();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setFetchError(null);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Could not load the menu');
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Brand.bg }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProducts(true)}
            tintColor={Brand.accent}
          />
        }
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-2 pb-5">
          <PressableScale scaleTo={0.98}>
            <Text className="text-[11px] font-semibold mb-1 tracking-wide uppercase" style={{ color: Brand.mutedLight }}>
              Deliver to
            </Text>
            <View className="flex-row items-center">
              <Feather name="map-pin" size={14} color={Brand.accent} />
              <Text className="text-gray-900 font-extrabold text-[15px] ml-1.5 mr-1">
                172 Grand St, NY
              </Text>
              <Feather name="chevron-down" size={15} color={Brand.ink} />
            </View>
          </PressableScale>

          <View className="flex-row items-center gap-2">
            <PressableScale
              onPress={() => router.push('/orders')}
              className="w-11 h-11 rounded-full items-center justify-center bg-white"
              style={{ borderWidth: 1, borderColor: Brand.border }}
            >
              <Feather name="clock" size={18} color={Brand.ink} />
            </PressableScale>
            <PressableScale
              onPress={() => router.push(token ? '/profile' : '/login')}
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ backgroundColor: Brand.accentSoft, borderWidth: 1, borderColor: '#FFD9C8' }}
            >
              <Text className="text-lg font-black" style={{ color: Brand.accent }}>
                {token ? initial : '?'}
              </Text>
            </PressableScale>
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Search */}
          <View className="px-6 mb-5">
            <View
              className="bg-white rounded-2xl px-4 py-3.5 flex-row items-center"
              style={{
                borderWidth: 1,
                borderColor: Brand.border,
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <Feather name="search" size={18} color={Brand.mutedLight} />
              <TextInput
                placeholder="Search burgers, pizza, drinks..."
                placeholderTextColor={Brand.mutedLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-[15px] text-gray-800 ml-3 font-medium"
              />
              {searchQuery.length > 0 && (
                <PressableScale onPress={() => setSearchQuery('')} scaleTo={0.9}>
                  <Feather name="x-circle" size={18} color={Brand.mutedLight} />
                </PressableScale>
              )}
            </View>
          </View>

          {/* Categories */}
          <View className="mb-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                const meta = CATEGORY_META[cat];
                return (
                  <PressableScale
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    scaleTo={0.94}
                    className="mr-3 items-center"
                  >
                    <View
                      className="w-[72px] py-3 rounded-[22px] items-center"
                      style={{
                        backgroundColor: active ? Brand.surface : 'transparent',
                        borderWidth: active ? 1 : 0,
                        borderColor: Brand.border,
                        shadowColor: '#000',
                        shadowOpacity: active ? 0.06 : 0,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 3 },
                        elevation: active ? 2 : 0,
                      }}
                    >
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mb-2"
                        style={{ backgroundColor: active ? Brand.accentSoft : '#EFECE8' }}
                      >
                        <Text className="text-2xl">{meta.emoji}</Text>
                      </View>
                      <Text
                        className="font-bold text-[11px]"
                        style={{ color: active ? Brand.ink : Brand.mutedLight }}
                      >
                        {meta.label}
                      </Text>
                    </View>
                  </PressableScale>
                );
              })}
            </ScrollView>
          </View>

          {/* Promo banner */}
          <View className="px-6 mb-7">
            <View
              className="rounded-[28px] p-6 overflow-hidden min-h-[168px] justify-center"
              style={{ backgroundColor: Brand.promo }}
            >
              <View className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
              <View className="absolute -right-4 bottom-0 w-28 h-28 rounded-full bg-white/5" />
              <View className="absolute right-4 top-6 opacity-90">
                <Text style={{ fontSize: 64 }}>🍔</Text>
              </View>

              <View className="bg-white/10 self-start px-2.5 py-1 rounded-md mb-3 flex-row items-center">
                <Text className="text-white text-[10px] font-bold tracking-widest">✦ FIRST ORDER</Text>
              </View>
              <Text className="text-white text-[26px] font-black w-[70%] mb-1.5 leading-8">
                Free delivery on your first order
              </Text>
              <Text className="text-white/50 text-xs mb-4 font-medium">No code needed · ends tonight</Text>
              <PressableScale
                onPress={() => {
                  if (filteredProducts[0]?._id) {
                    router.push(`/product/${filteredProducts[0]._id}`);
                  }
                }}
                className="bg-white rounded-full self-start px-5 py-2.5 flex-row items-center"
              >
                <Text className="text-black font-extrabold text-sm mr-2">Order now</Text>
                <Feather name="arrow-right" size={15} color="black" />
              </PressableScale>
            </View>
          </View>

          {/* Section header */}
          <View className="px-6 flex-row justify-between items-end mb-4">
            <View>
              <Text className="text-xl font-black text-gray-900">{selectedCategory}</Text>
              <Text className="text-xs font-medium mt-0.5" style={{ color: Brand.mutedLight }}>
                {loading ? 'Loading…' : `${filteredProducts.length} dishes`}
              </Text>
            </View>
            <PressableScale>
              <Text className="font-bold text-sm" style={{ color: Brand.accent }}>
                See all
              </Text>
            </PressableScale>
          </View>

          {/* Product grid */}
          <View className="px-6">
            {loading ? (
              <View className="py-16 items-center">
                <ActivityIndicator size="large" color={Brand.accent} />
                <Text className="text-gray-400 mt-3 font-medium">Loading menu…</Text>
              </View>
            ) : fetchError ? (
              <EmptyState
                icon="wifi-off"
                title="Couldn't load menu"
                subtitle={fetchError}
                actionLabel="Try again"
                onAction={() => fetchProducts()}
              />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon="search"
                title="No matches"
                subtitle={`Nothing in ${selectedCategory} for “${searchQuery || 'your search'}”.`}
                actionLabel="Clear filters"
                onAction={() => {
                  setSearchQuery('');
                  setSelectedCategory('Burgers');
                }}
              />
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {filteredProducts.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <FloatingCartBar />
    </SafeAreaView>
  );
}
