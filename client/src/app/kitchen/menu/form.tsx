import { useEffect, useState } from "react";
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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useAuthStore } from "../../../store/authStore";
import { API_BASE_URL } from "../../../config/api";
import { Brand, CATEGORY_META } from "../../../constants/brand";
import { IconButton } from "../../../components/ui/IconButton";
import { PrimaryButton } from "../../../components/ui/PrimaryButton";
import { PressableScale } from "../../../components/ui/PressableScale";

const CATEGORIES = Object.keys(CATEGORY_META);
const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/3075/3075977.png";
const CARD_IMAGE_ASPECT_RATIO = 3 / 2;

export default function KitchenMenuFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { token, user } = useAuthStore((s: any) => s);
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("Burgers");
  const [image, setImage] = useState(DEFAULT_IMAGE);
  const [imageId, setImageId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [prepTime, setPrepTime] = useState("15");
  const [calories, setCalories] = useState("");
  const [tags, setTags] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      Alert.alert("Kitchen only", "Admin account required.", [
        { text: "OK", onPress: () => router.replace("/") },
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
        if (!response.ok) throw new Error("Product not found");
        const p = await response.json();
        setName(p.name || "");
        setDescription(p.description || "");
        setPrice(String(p.price ?? ""));
        setOriginalPrice(
          p.originalPrice != null ? String(p.originalPrice) : "",
        );
        setCategory(p.category || "Burgers");
        setImage(p.image || DEFAULT_IMAGE);
        setImageId(p.imageId ?? null);
        setPrepTime(String(p.prepTime ?? 15));
        setCalories(p.calories != null ? String(p.calories) : "");
        setTags(Array.isArray(p.tags) ? p.tags.join(", ") : "");
        // Normalize server boolean (handle string 'false' sent by older clients)
        setIsAvailable(!(p.isAvailable === false || p.isAvailable === "false"));
      } catch (err: any) {
        Alert.alert("Error", err.message, [
          { text: "OK", onPress: () => router.back() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isEdit, id, token]);

  const validate = () => {
    if (!name.trim()) return "Name is required";
    if (!description.trim()) return "Description is required";
    if (!price || Number.isNaN(Number(price)) || Number(price) < 0)
      return "Valid price is required";
    if (!prepTime || Number.isNaN(Number(prepTime)) || Number(prepTime) < 1) {
      return "Prep time (minutes) is required";
    }
    if (!category) return "Category is required";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Check form", err);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        originalPrice: originalPrice === "" ? null : Number(originalPrice),
        category,
        // Send the image URL (Cloudinary or external). Keep `imageId` stored separately if needed.
        image: image.trim() || DEFAULT_IMAGE,
        // null clears a previous Cloudinary/local id when image is reset to default
        imageId: imageId || null,
        prepTime: Number(prepTime),
        calories: calories === "" ? undefined : Number(calories),
        tags,
        isAvailable,
      };

      const url = isEdit
        ? `${API_BASE_URL}/api/products/${id}`
        : `${API_BASE_URL}/api/products`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Save failed");

      Alert.alert(
        "Saved",
        isEdit ? "Product updated." : "Product added to menu.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e: any) {
      Alert.alert("Save failed", e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <SafeAreaView
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: Brand.bg }}
      >
        <ActivityIndicator color={Brand.accent} />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: Brand.bg }}
      >
        <ActivityIndicator size="large" color={Brand.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Brand.bg }}
      edges={["top"]}
    >
      <View className="px-5 py-3 flex-row items-center justify-between">
        <IconButton name="chevron-left" onPress={() => router.back()} />
        <Text className="text-lg font-black text-gray-900">
          {isEdit ? "Edit product" : "New product"}
        </Text>
        <View className="w-11" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Image section - Premium upload interface */}
          <View className="mb-6">
            <Text className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
              Product Image
            </Text>

            {/* Image preview card */}
            <View
              className="rounded-2xl overflow-hidden mb-3 border-2 border-dashed"
              style={{
                borderColor: Brand.accent,
                backgroundColor: Brand.surface,
              }}
            >
              <View className="bg-gradient-to-br from-gray-50 to-gray-100 aspect-video justify-center items-center">
                {image && image !== DEFAULT_IMAGE ? (
                  <Image
                    source={{ uri: image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center">
                    <Feather name="image" size={48} color={Brand.mutedLight} />
                    <Text className="text-gray-400 text-sm mt-2 font-medium">
                      No image selected
                    </Text>
                  </View>
                )}
              </View>

              {/* Image controls */}
              <View
                className="p-3 border-t"
                style={{ borderTopColor: Brand.border }}
              >
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <PrimaryButton
                      label={uploading ? "Uploading..." : "Upload image"}
                      onPress={async () => {
                        if (!token) {
                          Alert.alert("Not authenticated");
                          return;
                        }

                        if (
                          !ImagePicker ||
                          !ImagePicker.requestMediaLibraryPermissionsAsync
                        ) {
                          Alert.alert(
                            "Unsupported",
                            "Image picker is not available on this platform. Please use the Image URL field instead.",
                          );
                          return;
                        }

                        try {
                          const { status } =
                            await ImagePicker.requestMediaLibraryPermissionsAsync();
                          if (status !== "granted") {
                            Alert.alert(
                              "Permission required",
                              "Permission to access photos is required.",
                            );
                            return;
                          }

                          const result =
                            await ImagePicker.launchImageLibraryAsync({
                              mediaTypes: ["images"],
                              quality: 0.8,
                              allowsEditing: true,
                            });

                          const r: any = result as any;
                          if (r.canceled === true || r.cancelled === true)
                            return;
                          const asset = r.assets?.[0] ?? r;
                          const uri = asset?.uri;
                          if (!uri) return;

                          setUploading(true);

                          const sourceWidth = Number(asset.width);
                          const sourceHeight = Number(asset.height);
                          let uploadUri = uri;
                          if (sourceWidth > 0 && sourceHeight > 0) {
                            const sourceRatio = sourceWidth / sourceHeight;
                            const crop =
                              sourceRatio > CARD_IMAGE_ASPECT_RATIO
                                ? {
                                    width: Math.round(
                                      sourceHeight * CARD_IMAGE_ASPECT_RATIO,
                                    ),
                                    height: sourceHeight,
                                    originX: Math.round(
                                      (sourceWidth -
                                        sourceHeight *
                                          CARD_IMAGE_ASPECT_RATIO) /
                                        2,
                                    ),
                                    originY: 0,
                                  }
                                : {
                                    width: sourceWidth,
                                    height: Math.round(
                                      sourceWidth / CARD_IMAGE_ASPECT_RATIO,
                                    ),
                                    originX: 0,
                                    originY: Math.round(
                                      (sourceHeight -
                                        sourceWidth / CARD_IMAGE_ASPECT_RATIO) /
                                        2,
                                    ),
                                  };

                            const cropped =
                              await ImageManipulator.manipulateAsync(
                                uri,
                                [{ crop }],
                                {
                                  compress: 0.85,
                                  format: ImageManipulator.SaveFormat.JPEG,
                                },
                              );
                            uploadUri = cropped.uri;
                          }

                          const formData = new FormData();
                          const filename =
                            uploadUri.split("/").pop() ||
                            `image-${Date.now()}.jpg`;

                          // React Native FormData - directly append file URI
                          if (Platform.OS === "web") {
                            // Web: fetch as blob
                            const response = await fetch(uploadUri);
                            const blob = await response.blob();
                            formData.append("image", blob, filename);
                          } else {
                            // React Native: use file URI directly
                            formData.append("image", {
                              uri: uploadUri,
                              type: "image/jpeg",
                              name: filename,
                            } as any);
                          }

                          const resp = await fetch(
                            `${API_BASE_URL}/api/products/upload`,
                            {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                              body: formData,
                            },
                          );

                          const data = await resp.json();
                          if (!resp.ok) {
                            throw new Error(data.message || "Upload failed");
                          }

                          const url = data.url || data.path || data.location;
                          const public_id = data.public_id || data.filename;

                          if (!url) {
                            throw new Error(
                              "Server did not return an image URL",
                            );
                          }

                          setImageId(public_id || null);
                          setImage(url);
                          Alert.alert(
                            "Success",
                            `✓ Image uploaded\n(${data.storage === "cloudinary" ? "Cloud storage" : "Local storage"})`,
                          );
                        } catch (err: any) {
                          console.error("Upload error:", err);
                          Alert.alert(
                            "Upload failed",
                            err.message ||
                              "Check your connection and try again",
                          );
                        } finally {
                          setUploading(false);
                        }
                      }}
                      loading={uploading}
                    />
                  </View>
                  {image && image !== DEFAULT_IMAGE && (
                    <PressableScale
                      onPress={() => {
                        setImage(DEFAULT_IMAGE);
                        setImageId(null);
                      }}
                      className="px-4 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: Brand.surface,
                        borderWidth: 1,
                        borderColor: Brand.border,
                      }}
                    >
                      <Feather name="trash-2" size={18} color={Brand.muted} />
                    </PressableScale>
                  )}
                </View>
              </View>
            </View>

            {/* Manual URL input */}
            <View>
              <Text className="text-xs font-medium text-gray-600 mb-2">
                Or paste image URL:
              </Text>
              <View
                className="flex-row items-center px-3 rounded-xl bg-white border"
                style={{ borderColor: Brand.border }}
              >
                <Feather name="link" size={16} color={Brand.muted} />
                <TextInput
                  placeholder="https://example.com/image.jpg"
                  value={image === DEFAULT_IMAGE ? "" : image}
                  onChangeText={(text) => {
                    setImage(text || DEFAULT_IMAGE);
                    // Manual URL is not a server-managed upload — drop prior asset id
                    setImageId(null);
                  }}
                  placeholderTextColor={Brand.mutedLight}
                  className="flex-1 text-gray-800 font-medium py-3 ml-2"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          <Field
            label="Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. BBQ Smash Burger"
          />
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
                <PressableScale
                  key={cat}
                  onPress={() => setCategory(cat)}
                  scaleTo={0.96}
                >
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
                      style={{ color: active ? "#fff" : Brand.ink }}
                    >
                      {cat}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>

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
              <Text className="font-extrabold text-gray-900">
                Available on menu
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                Off = sold out (hidden from customers)
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: "#E5E7EB", true: "#FDBA74" }}
              thumbColor={isAvailable ? Brand.accent : "#f4f3f4"}
            />
          </View>

          <PrimaryButton
            label={isEdit ? "Save changes" : "Create product"}
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
          multiline ? "py-3.5 min-h-[96px]" : "py-3.5"
        }`}
        style={{
          borderWidth: 1,
          borderColor: Brand.border,
          textAlignVertical: multiline ? "top" : "center",
        }}
        placeholderTextColor={Brand.mutedLight}
        multiline={multiline}
        {...props}
      />
    </View>
  );
}
