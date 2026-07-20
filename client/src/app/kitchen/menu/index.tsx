import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { API_BASE_URL } from '../../../config/api';
import { Brand, CATEGORY_META } from '../../../constants/brand';
import { IconButton } from '../../../components/ui/IconButton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PressableScale } from '../../../components/ui/PressableScale';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  prepTime: number;
  isAvailable: boolean;
  tags?: string[];
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'On menu' },
  { key: 'soldout', label: 'Sold out' },
] as const;

export default function KitchenMenuScreen() {
  const router = useRouter();
  const { token, user } = useAuthStore((s: any) => s);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const fetchProducts = useCallback(
    async (opts?: { pull?: boolean }) => {
      if (!token) return;
      try {
        if (opts?.pull) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/products/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 403) {
          throw new Error('Kitchen access only — admin account required.');
        }
        if (!response.ok) throw new Error('Could not load menu');

        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'admin') {
      Alert.alert('Kitchen only', 'Menu management is for kitchen staff.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    }
  }, [user, router]);

  useFocusEffect(
    useCallback(() => {
      if (token && isAdmin) fetchProducts();
    }, [token, isAdmin, fetchProducts])
  );

  const toggleAvailability = async (product: Product) => {
    setBusyId(product._id);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${product._id}/availability`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isAvailable: !product.isAvailable }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Update failed');

      setProducts((prev) => prev.map((p) => (p._id === product._id ? data : p)));
    } catch (err: any) {
      Alert.alert('Update failed', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = (product: Product) => {
    Alert.alert(
      'Delete permanently?',
      `"${product.name}" will be removed. Prefer “Sold out” if it might return.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProduct(product),
        },
      ]
    );
  };

  const deleteProduct = async (product: Product) => {
    setBusyId(product._id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Delete failed');
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err: any) {
      Alert.alert('Delete failed', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const filtered = products.filter((p) => {
    if (filter === 'available' && !p.isAvailable) return false;
    if (filter === 'soldout' && p.isAvailable) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    return true;
  });

  const categories = Object.keys(CATEGORY_META);

  if (!user || !isAdmin) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: Brand.bg }}>
        <ActivityIndicator color={Brand.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Brand.bg }} edges={['top']}>
      <View className="px-5 py-3 flex-row items-center justify-between">
        <IconButton name="chevron-left" onPress={() => router.back()} />
        <View className="items-center flex-1 px-2">
          <Text className="text-lg font-black text-gray-900">Menu manager</Text>
          <Text className="text-[11px] font-medium" style={{ color: Brand.mutedLight }}>
            {products.length} items · {products.filter((p) => p.isAvailable).length} on menu
          </Text>
        </View>
        <IconButton name="plus" onPress={() => router.push('/kitchen/menu/form')} />
      </View>

      {/* Availability filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <PressableScale key={f.key} onPress={() => setFilter(f.key)} scaleTo={0.96}>
              <View
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: active ? Brand.ink : Brand.surface,
                  borderWidth: 1,
                  borderColor: active ? Brand.ink : Brand.border,
                }}
              >
                <Text className="font-extrabold text-sm" style={{ color: active ? '#fff' : Brand.ink }}>
                  {f.label}
                </Text>
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
      >
        <PressableScale onPress={() => setCategoryFilter(null)} scaleTo={0.96}>
          <View
            className="px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: !categoryFilter ? Brand.accentSoft : Brand.surface,
              borderWidth: 1,
              borderColor: !categoryFilter ? Brand.accent : Brand.border,
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: !categoryFilter ? Brand.accent : Brand.muted }}
            >
              Any category
            </Text>
          </View>
        </PressableScale>
        {categories.map((cat) => {
          const active = categoryFilter === cat;
          return (
            <PressableScale key={cat} onPress={() => setCategoryFilter(cat)} scaleTo={0.96}>
              <View
                className="px-3 py-1.5 rounded-full flex-row items-center"
                style={{
                  backgroundColor: active ? Brand.accentSoft : Brand.surface,
                  borderWidth: 1,
                  borderColor: active ? Brand.accent : Brand.border,
                }}
              >
                <Text className="text-xs mr-1">{CATEGORY_META[cat]?.emoji}</Text>
                <Text
                  className="text-xs font-bold"
                  style={{ color: active ? Brand.accent : Brand.muted }}
                >
                  {cat}
                </Text>
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Brand.accent} />
        </View>
      ) : error ? (
        <EmptyState
          icon="wifi-off"
          title="Couldn’t load menu"
          subtitle={error}
          actionLabel="Retry"
          onAction={() => fetchProducts()}
        />
      ) : (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchProducts({ pull: true })}
              tintColor={Brand.accent}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon="book-open"
              title="No items here"
              subtitle="Add a dish or change filters. Sold-out items stay here until you bring them back."
              actionLabel="Add product"
              onAction={() => router.push('/kitchen/menu/form')}
            />
          ) : (
            filtered.map((product) => {
              const busy = busyId === product._id;
              return (
                <View
                  key={product._id}
                  className="bg-white rounded-[22px] mb-3 p-3.5"
                  style={{
                    borderWidth: 1,
                    borderColor: product.isAvailable ? Brand.border : '#FECACA',
                    opacity: busy ? 0.7 : 1,
                  }}
                >
                  <View className="flex-row">
                    <View
                      className="w-16 h-16 rounded-2xl items-center justify-center mr-3 overflow-hidden"
                      style={{ backgroundColor: Brand.bg, borderWidth: 1, borderColor: Brand.border }}
                    >
                      <Image
                        source={{ uri: product.image }}
                        className="w-14 h-14"
                        resizeMode="contain"
                      />
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-start justify-between">
                        <Text className="font-extrabold text-gray-900 text-[15px] flex-1 mr-2" numberOfLines={1}>
                          {product.name}
                        </Text>
                        <Text className="font-black text-gray-900">
                          ${Number(product.price).toFixed(2)}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-400 font-medium mt-0.5">
                        {product.category} · {product.prepTime} min
                      </Text>
                      <View className="flex-row items-center mt-1.5">
                        <View
                          className="px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: product.isAvailable
                              ? Brand.successSoft
                              : Brand.dangerSoft,
                          }}
                        >
                          <Text
                            className="text-[10px] font-extrabold uppercase"
                            style={{
                              color: product.isAvailable ? Brand.success : Brand.danger,
                            }}
                          >
                            {product.isAvailable ? 'On menu' : 'Sold out'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row mt-3 gap-2">
                    <PressableScale
                      onPress={() =>
                        router.push({
                          pathname: '/kitchen/menu/form',
                          params: { id: product._id },
                        })
                      }
                      className="flex-1"
                    >
                      <View
                        className="py-2.5 rounded-full items-center flex-row justify-center"
                        style={{ backgroundColor: Brand.bg, borderWidth: 1, borderColor: Brand.border }}
                      >
                        <Feather name="edit-2" size={14} color={Brand.ink} />
                        <Text className="ml-1.5 font-bold text-sm text-gray-900">Edit</Text>
                      </View>
                    </PressableScale>

                    <PressableScale
                      onPress={() => toggleAvailability(product)}
                      disabled={busy}
                      className="flex-1"
                    >
                      <View
                        className="py-2.5 rounded-full items-center flex-row justify-center"
                        style={{
                          backgroundColor: product.isAvailable
                            ? Brand.warningSoft
                            : Brand.successSoft,
                          borderWidth: 1,
                          borderColor: product.isAvailable ? '#FDE68A' : '#A7F3D0',
                        }}
                      >
                        <Feather
                          name={product.isAvailable ? 'eye-off' : 'eye'}
                          size={14}
                          color={product.isAvailable ? '#B45309' : Brand.success}
                        />
                        <Text
                          className="ml-1.5 font-bold text-sm"
                          style={{
                            color: product.isAvailable ? '#B45309' : Brand.success,
                          }}
                        >
                          {product.isAvailable ? 'Sold out' : 'Restock'}
                        </Text>
                      </View>
                    </PressableScale>

                    <PressableScale onPress={() => confirmDelete(product)} disabled={busy}>
                      <View
                        className="w-11 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: Brand.dangerSoft }}
                      >
                        <Feather name="trash-2" size={15} color={Brand.danger} />
                      </View>
                    </PressableScale>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* FAB-style footer add */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-2">
        <PrimaryButton
          label="Add new product"
          onPress={() => router.push('/kitchen/menu/form')}
          icon={<Feather name="plus" size={18} color="#fff" />}
        />
      </View>
    </SafeAreaView>
  );
}
