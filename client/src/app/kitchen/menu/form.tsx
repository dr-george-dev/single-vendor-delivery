import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../../store/authStore';
import { API_BASE_URL } from '../../../config/api';
import { Brand, CATEGORY_META } from '../../../constants/brand';
import { IconButton } from '../../../components/ui/IconButton';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { PressableScale } from '../../../components/ui/PressableScale';

const CATEGORIES = Object.keys(CATEGORY_META);
const DEFAULT_IMAGE = 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png';

export default function KitchenMenuFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { token, user } = useAuthStore((s: any) => s);
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('Burgers');
  const [image, setImage] = useState(DEFAULT_IMAGE);
  const [imageId, setImageId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [prepTime, setPrepTime] = useState('15');
  const [calories, setCalories] = useState('');
  const [tags, setTags] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'admin') {
      Alert.alert('Kitchen only', 'Admin account required.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    }
  }, [user, router]);

  useEffect(() => {
    if (!isEdit || !id || !token) return;

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Product not found');
        const p = await response.json();
        setName(p.name || '');
        setDescription(p.description || '');
        setPrice(String(p.price ?? ''));
        setOriginalPrice(p.originalPrice != null ? String(p.originalPrice) : '');
        setCategory(p.category || 'Burgers');
        setImage(p.image || DEFAULT_IMAGE);
        setImageId(p.imageId ?? null);
        setPrepTime(String(p.prepTime ?? 15));
        setCalories(p.calories != null ? String(p.calories) : '');
        setTags(Array.isArray(p.tags) ? p.tags.join(', ') : '');
        // Normalize server boolean (handle string 'false' sent by older clients)
        setIsAvailable(!(p.isAvailable === false || p.isAvailable === 'false'));
      } catch (err: any) {
        Alert.alert('Error', err.message, [{ text: 'OK', onPress: () => router.back() }]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isEdit, id, token]);

  const validate = () => {
    if (!name.trim()) return 'Name is required';
    if (!description.trim()) return 'Description is required';
    if (!price || Number.isNaN(Number(price)) || Number(price) < 0) return 'Valid price is required';
    if (!prepTime || Number.isNaN(Number(prepTime)) || Number(prepTime) < 1) {
      return 'Prep time (minutes) is required';
    }
    if (!category) return 'Category is required';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      Alert.alert('Check form', err);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        originalPrice: originalPrice === '' ? null : Number(originalPrice),
        category,
        // Send the image URL (Cloudinary or external). Keep `imageId` stored separately if needed.
        image: image.trim() || DEFAULT_IMAGE,
        prepTime: Number(prepTime),
        calories: calories === '' ? undefined : Number(calories),
        tags,
        isAvailable,
      };

      const url = isEdit
        ? `${API_BASE_URL}/api/products/${id}`
        : `${API_BASE_URL}/api/products`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Save failed');

      Alert.alert('Saved', isEdit ? 'Product updated.' : 'Product added to menu.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Save failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: Brand.bg }}>
        <ActivityIndicator color={Brand.accent} />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: Brand.bg }}>
        <ActivityIndicator size="large" color={Brand.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Brand.bg }} edges={['top']}>
      <View className="px-5 py-3 flex-row items-center justify-between">
        <IconButton name="chevron-left" onPress={() => router.back()} />
        <Text className="text-lg font-black text-gray-900">
          {isEdit ? 'Edit product' : 'New product'}
        </Text>
        <View className="w-11" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Image preview */}
          <View
            className="items-center py-5 mb-4 rounded-[24px]"
            style={{ backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.border }}
          >
            <Image
              source={{ uri: image || DEFAULT_IMAGE }}
              className="w-28 h-28"
              resizeMode="contain"
            />
            <Text className="text-xs text-gray-400 mt-2 font-medium">Image preview</Text>
            <View className="mt-3 w-full px-4">
              <PrimaryButton
                label={uploading ? 'Uploading...' : 'Pick & upload image'}
                onPress={async () => {
                  if (!token) {
                    Alert.alert('Not authenticated');
                    return;
                  }

                  // Guard: expo-image-picker may be undefined on some platforms (web or Expo Go mismatch)
                  if (!ImagePicker || !ImagePicker.requestMediaLibraryPermissionsAsync) {
                    Alert.alert(
                      'Unsupported',
                      'Image picker is not available on this platform. Please paste an image URL in the Image URL field instead.'
                    );
                    return;
                  }

                  try {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== 'granted') {
                      Alert.alert('Permission required', 'Permission to access photos is required.');
                      return;
                    }

                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ['images'],
                      quality: 0.8,
                      allowsEditing: true,
                    });

                    // Newer expo returns assets array and `canceled` flag.
                    const r: any = result as any;
                    if (r.canceled === true || r.cancelled === true) return;
                    const uri = r.assets?.[0]?.uri ?? r.uri;
                    if (!uri) return;

                    setUploading(true);

                    const formData = new FormData();
                    const filename = uri.split('/').pop() || `image-${Date.now()}.jpg`;
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : 'image/jpeg';

                    if (Platform.OS === 'web') {
                      const response = await fetch(uri);
                      const blob = await response.blob();
                      formData.append('image', blob, filename);
                    } else {
                      // @ts-ignore - React Native FormData file object
                      formData.append('image', { uri, name: filename, type });
                    }

                    const resp = await fetch(`${API_BASE_URL}/api/products/upload`, {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                      body: formData,
                    });

                    const data = await resp.json();
                    if (!resp.ok) throw new Error(data.message || 'Upload failed');

                    // server returns { url, public_id }
                    const url = data.url || data.path || data.location;
                    const public_id = data.public_id || data.filename;
                    setImageId(public_id || null);
                    setImage(url || DEFAULT_IMAGE);
                    Alert.alert('Uploaded', 'Image uploaded and set for the product.');
                  } catch (err: any) {
                    Alert.alert('Upload failed', err.message || String(err));
                  } finally {
                    setUploading(false);
                  }
                }}
                loading={uploading}
              />
            </View>
          </View>

          <Field label="Name *" value={name} onChangeText={setName} placeholder="e.g. BBQ Smash Burger" />
          <Field
            label="Description *"
            value={description}
            onChangeText={setDescription}
            placeholder="What makes this dish special?"
            multiline
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field
                label="Price *"
                value={price}
                onChangeText={setPrice}
                placeholder="12.99"
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <Field
                label="Compare-at price"
                value={originalPrice}
                onChangeText={setOriginalPrice}
                placeholder="15.99"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Text className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
            Category *
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <PressableScale key={cat} onPress={() => setCategory(cat)} scaleTo={0.96}>
                  <View
                    className="px-3.5 py-2.5 rounded-full flex-row items-center"
                    style={{
                      backgroundColor: active ? Brand.ink : Brand.surface,
                      borderWidth: 1,
                      borderColor: active ? Brand.ink : Brand.border,
                    }}
                  >
                    <Text className="mr-1">{CATEGORY_META[cat]?.emoji}</Text>
                    <Text
                      className="text-sm font-bold"
                      style={{ color: active ? '#fff' : Brand.ink }}
                    >
                      {cat}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>

          <Field
            label="Image URL"
            value={image}
            onChangeText={setImage}
            placeholder="https://..."
            autoCapitalize="none"
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field
                label="Prep time (min) *"
                value={prepTime}
                onChangeText={setPrepTime}
                placeholder="15"
                keyboardType="number-pad"
              />
            </View>
            <View className="flex-1">
              <Field
                label="Calories"
                value={calories}
                onChangeText={setCalories}
                placeholder="650"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Field
            label="Tags (comma separated)"
            value={tags}
            onChangeText={setTags}
            placeholder="Popular, Spicy, New"
          />

          <View
            className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3.5 mb-6"
            style={{ borderWidth: 1, borderColor: Brand.border }}
          >
            <View className="flex-1 mr-3">
              <Text className="font-extrabold text-gray-900">Available on menu</Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                Off = sold out (hidden from customers)
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#E5E7EB', true: '#FDBA74' }}
              thumbColor={isAvailable ? Brand.accent : '#f4f3f4'}
            />
          </View>

          <PrimaryButton
            label={isEdit ? 'Save changes' : 'Create product'}
            onPress={handleSave}
            loading={saving}
            icon={<Feather name="check" size={18} color="#fff" />}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  multiline,
  ...props
}: {
  label: string;
  multiline?: boolean;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View className="mb-3.5">
      <Text className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </Text>
      <TextInput
        className={`bg-white rounded-2xl px-4 text-[15px] text-gray-800 font-medium ${
          multiline ? 'py-3.5 min-h-[96px]' : 'py-3.5'
        }`}
        style={{ borderWidth: 1, borderColor: Brand.border, textAlignVertical: multiline ? 'top' : 'center' }}
        placeholderTextColor={Brand.mutedLight}
        multiline={multiline}
        {...props}
      />
    </View>
  );
}
