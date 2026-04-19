import React, { useState } from 'react';
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
import { useBudget } from '../context/BudgetContext';
import { colors } from '../theme/colors';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function UploadScreen({ navigation }) {
  const { addTransaction } = useBudget();
  const [imageUri, setImageUri] = useState(null);
  const [imageName, setImageName] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  async function pickImage(fromCamera) {
    let result;

    if (fromCamera) { 
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Camera access is needed to take a photo.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  async function handleAddAsExpense() {
    if (!imageUri || !imageBase64) {
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
                    url: `data:image/jpeg;base64,${imageBase64}`,
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
        imageUri,
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
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.heading}>Upload Payment</Text>
        <Text style={styles.sub}>Capture or select a payment screenshot</Text>

        {/* Pick buttons */}
        <View style={styles.pickRow}>
          <Pressable style={styles.pickBtn} onPress={() => pickImage(true)}>
            <Text style={styles.pickIcon}>📷</Text>
            <Text style={styles.pickText}>Camera</Text>
          </Pressable>
          <Pressable style={styles.pickBtn} onPress={() => pickImage(false)}>
            <Text style={styles.pickIcon}>🖼️</Text>
            <Text style={styles.pickText}>Gallery</Text>
          </Pressable>
        </View>

        {/* Preview */}
        {imageUri ? (
          <View style={styles.previewCard}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
            {imageName && <Text style={styles.imageName}>{imageName}</Text>}

            {/* OCR Banner */}
            <View style={styles.ocrBanner}>
              <Text style={styles.ocrIcon}>✨</Text>
              <View style={styles.ocrText}>
                <Text style={styles.ocrTitle}>Groq AI Active</Text>
                <Text style={styles.ocrSub}>
                  Amount, merchant, and date will be auto-extracted.
                </Text>
              </View>
            </View>

            <Pressable style={styles.addBtn} onPress={handleAddAsExpense} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.addBtnText}>➕  Add as Expense</Text>
              )}
            </Pressable>

            <Pressable style={styles.clearBtn} onPress={() => { setImageUri(null); setImageName(null); setImageBase64(null); }} disabled={loading}>
              <Text style={[styles.clearBtnText, loading && { opacity: 0.5 }]}>Remove Image</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📤</Text>
            <Text style={styles.placeholderText}>No screenshot selected</Text>
            <Text style={styles.placeholderSub}>
              Use the buttons above to pick an image
            </Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How to use</Text>
          <Text style={styles.infoText}>
            1. Take or select a UPI / bank payment screenshot{'\n'}
            2. Tap "Add as Expense" to log it{'\n'}
            3. Find the entry in Transactions and update the amount manually{'\n\n'}
            🔮 OCR auto-extraction will be added in a future release.
          </Text>
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
    paddingTop: 28,
    gap: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  sub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -8,
  },
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
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: 8,
  },
  pickIcon: {
    fontSize: 32,
  },
  pickText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 0,
  },
  preview: {
    width: '100%',
    height: 280,
    backgroundColor: colors.surfaceLight,
  },
  imageName: {
    color: colors.textMuted,
    fontSize: 11,
    paddingHorizontal: 14,
    paddingTop: 8,
    fontStyle: 'italic',
  },
  ocrBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '22',
    padding: 12,
    margin: 12,
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  ocrIcon: {
    fontSize: 22,
  },
  ocrText: {
    flex: 1,
    gap: 3,
  },
  ocrTitle: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  ocrSub: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  addBtn: {
    backgroundColor: colors.primary,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  clearBtn: {
    alignItems: 'center',
    paddingBottom: 14,
  },
  clearBtnText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  placeholder: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 60,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: 8,
  },
  placeholderIcon: {
    fontSize: 44,
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
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
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
