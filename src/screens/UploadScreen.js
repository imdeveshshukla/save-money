import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from '../context/BudgetContext';
import { colors } from '../theme/colors';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function UploadScreen({ navigation, route }) {
  const { addTransaction, activeCategory } = useBudget();
  const [imageUri, setImageUri] = useState(null);
  const [imageName, setImageName] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSharedImage, setIsSharedImage] = useState(false);

  // Handle image shared from another app (e.g. GPay share sheet)
  useEffect(() => {
    const sharedUri = route?.params?.sharedImageUri;
    if (!sharedUri) return;

    async function loadSharedImage() {
      try {
        setLoading(true);
        let safeUri = sharedUri;
        // If Android returns a raw absolute path, FileSystem needs the file:// prefix
        if (safeUri.startsWith('/')) {
          safeUri = 'file://' + safeUri;
        }

        const base64 = await FileSystem.readAsStringAsync(safeUri, {
          encoding: 'base64',
        });
        setImageUri(safeUri);
        setImageName('shared_screenshot.jpg');
        setImageBase64(base64);
        setIsSharedImage(true);
        
        // Automatically extract & add expense since user shared it to this app!
        await handleAddAsExpense(safeUri, base64);
      } catch (e) {
        Alert.alert('Error', `Could not load the shared image.\nReason: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadSharedImage();
  }, [route?.params?.sharedImageUri]);

  function clearImage() {
    setImageUri(null);
    setImageName(null);
    setImageBase64(null);
    setIsSharedImage(false);
  }

  async function pickImage(fromCamera) {
    let result;

    if (fromCamera) { 
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Camera access is needed to take a photo.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      });
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Gallery access is needed to upload screenshots.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageName(asset.fileName || 'payment_screenshot.jpg');
      setImageBase64(asset.base64);
    }
  }

  async function handleAddAsExpense(customUri, customBase64) {
    // Buttons pass a GestureResponderEvent on click. Clean it if so:
    const isSyntheticEvent = customUri && typeof customUri === 'object' && customUri.nativeEvent;
    
    const targetUri = (!isSyntheticEvent && customUri) ? customUri : imageUri;
    const targetBase64 = customBase64 ? customBase64 : imageBase64;

    if (!targetUri || !targetBase64) {
      Alert.alert('No image', 'Please select a screenshot first.');
      return;
    }

    const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    console.log('Groq API Key present:', !!apiKey);
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      Alert.alert(
        'Missing API Key',
        'Please add your Groq API key to .env as EXPO_PUBLIC_GROQ_API_KEY.\n\nGet a free key at https://console.groq.com/keys'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: "Extract payment details from this payment screenshot. Respond ONLY with a valid JSON object (no markdown, no explanation) with these fields: 'amount' (number, payment amount), 'payee' (string, full name or UPI ID of the recipient/payee), 'merchant' (string, merchant or business name if visible, else same as payee), 'date' (YYYY-MM-DD, payment date), 'note' (string, brief description of what the payment was for).",
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${targetBase64}`,
                  },
                },
              ],
            },
          ],
          temperature: 0,
          max_tokens: 256,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Groq API Error');
      }

      let resultText = data.choices[0].message.content;
      // Strip any accidental markdown code fences
      resultText = resultText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(resultText);

      // Build a descriptive title from payee and/or merchant
      const payee = parsed.payee || '';
      const merchant = parsed.merchant || '';
      let title = 'Payment Screenshot';
      if (payee && merchant && payee.toLowerCase() !== merchant.toLowerCase()) {
        title = `${payee} – ${merchant}`;
      } else if (payee) {
        title = payee;
      } else if (merchant) {
        title = merchant;
      }

      addTransaction({
        id: generateId(),
        type: 'expense',
        title,
        amount: parsed.amount || 0,
        date: parsed.date || todayString(),
        note: parsed.note || 'Extracted via Groq AI',
        imageUri: targetUri,
      });

      Alert.alert(
        'Success!',
        'Transaction processed with Groq AI successfully.',
        [
          { text: 'Go to Transactions', onPress: () => navigation.navigate('Transactions') },
          { text: 'OK' },
        ]
      );

      setImageUri(null);
      setImageName(null);
      setImageBase64(null);

    } catch (error) {
      Alert.alert('Extraction Failed', `Could not extract data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.heading}>Scan Payment</Text>
        <Text style={styles.sub}>Capture or select a payment screenshot</Text>

        {/* Active Category badge */}
        <View style={styles.categoryBadge}>
          <Ionicons name="folder-open-outline" size={16} color={colors.primary} />
          <Text style={styles.categoryBadgeLabel}>Saving to:</Text>
          <Text style={styles.categoryBadgeName}>
            {activeCategory?.name ?? 'No category selected'}
          </Text>
        </View>

        {/* Pick buttons */}
        <View style={styles.pickRow}>
          <Pressable
            style={({ pressed }) => [styles.pickBtn, pressed && { opacity: 0.8 }]}
            onPress={() => pickImage(true)}
          >
            <View style={styles.pickIconBox}>
              <Ionicons name="camera-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.pickText}>Camera</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.pickBtn, pressed && { opacity: 0.8 }]}
            onPress={() => pickImage(false)}
          >
            <View style={styles.pickIconBox}>
              <Ionicons name="images-outline" size={28} color="#6366F1" />
            </View>
            <Text style={styles.pickText}>Gallery</Text>
          </Pressable>
        </View>

        {/* Preview */}
        {imageUri ? (
          <View style={styles.previewCard}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
            {imageName && <Text style={styles.imageName}>{imageName}</Text>}

            {/* Shared image banner */}
            {isSharedImage && (
              <View style={styles.sharedBanner}>
                <Ionicons name="share-outline" size={18} color={colors.primary} />
                <View style={styles.bannerTextBox}>
                  <Text style={styles.sharedBannerTitle}>Received via Share</Text>
                  <Text style={styles.bannerSub}>Tap below to extract & save.</Text>
                </View>
              </View>
            )}

            {/* AI Banner */}
            <View style={styles.aiBanner}>
              <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
              <View style={styles.bannerTextBox}>
                <Text style={styles.aiTitle}>AI Auto-Extract</Text>
                <Text style={styles.bannerSub}>
                  Amount, merchant, and date will be detected.
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
              onPress={handleAddAsExpense}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color={colors.white} />
                  <Text style={styles.addBtnText}>Add as Expense</Text>
                </>
              )}
            </Pressable>

            <Pressable style={styles.clearBtn} onPress={clearImage} disabled={loading}>
              <Text style={[styles.clearBtnText, loading && { opacity: 0.5 }]}>Remove Image</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.placeholderIconBox}>
              <Ionicons name="cloud-upload-outline" size={40} color={colors.textMuted} />
            </View>
            <Text style={styles.placeholderText}>No screenshot selected</Text>
            <Text style={styles.placeholderSub}>
              Use the buttons above to pick an image
            </Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <View style={styles.infoTextBox}>
            <Text style={styles.infoTitle}>How to use</Text>
            <Text style={styles.infoText}>
              1. Take or select a UPI / bank payment screenshot{'\n'}
              2. Or share a screenshot directly from GPay / PhonePe{'\n'}
              3. Tap "Add as Expense" — AI extracts all details
            </Text>
          </View>
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 20,
    paddingTop: 24,
    gap: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  sub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -8,
  },
  // Category Badge
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryBadgeLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  categoryBadgeName: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  // Pick Buttons
  pickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Preview
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: {
    width: '100%',
    height: 260,
    backgroundColor: colors.surfaceLight,
  },
  imageName: {
    color: colors.textMuted,
    fontSize: 11,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  // Banners
  sharedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    padding: 12,
    margin: 12,
    marginBottom: 0,
    borderRadius: 10,
    gap: 10,
  },
  sharedBannerTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    padding: 12,
    margin: 12,
    marginBottom: 0,
    borderRadius: 10,
    gap: 10,
  },
  bannerTextBox: {
    flex: 1,
    gap: 2,
  },
  aiTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  bannerSub: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  // Buttons
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  addBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  clearBtn: {
    alignItems: 'center',
    paddingBottom: 14,
    paddingTop: 4,
  },
  clearBtnText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  // Placeholder
  placeholder: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderIconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderSub: {
    color: colors.textMuted,
    fontSize: 13,
  },
  // Info
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    padding: 16,
  },
  infoTextBox: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
  },
});
