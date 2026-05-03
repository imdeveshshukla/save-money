import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from '../context/BudgetContext';
import { colors } from '../theme/colors';

const FILE_EXT = '.budgetapp';
const MIME_TYPE = 'application/json';

// ── helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function buildFileName() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `budget_backup_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}${FILE_EXT}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DataScreen() {
  const { categories, getExportPayload, importData } = useBudget();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [lastExportInfo, setLastExportInfo] = useState(null); // { fileName, size, time }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalTransactions = categories.reduce(
    (sum, c) => sum + c.transactions.length,
    0
  );
  const totalCategories = categories.length;

  // ── Export ─────────────────────────────────────────────────────────────────
  async function handleExport() {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      Alert.alert('Not Supported', 'Sharing is not available on this device.');
      return;
    }

    setExporting(true);
    try {
      const payload = getExportPayload();
      const json = JSON.stringify(payload, null, 2);
      const fileName = buildFileName();
      const fileUri = FileSystem.cacheDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const info = await FileSystem.getInfoAsync(fileUri);
      setLastExportInfo({
        fileName,
        size: formatBytes(info.size ?? json.length),
        time: new Date().toLocaleTimeString(),
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: MIME_TYPE,
        dialogTitle: 'Save or share your BudgetApp backup',
        UTI: 'public.json',
      });
    } catch (e) {
      Alert.alert('Export Failed', e.message);
    } finally {
      setExporting(false);
    }
  }

  // ── Import ─────────────────────────────────────────────────────────────────
  async function handleImport() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [MIME_TYPE, 'application/octet-stream', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      const uri = asset.uri;

      setImporting(true);

      const raw = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        Alert.alert('Import Failed', 'The selected file is not valid JSON.');
        return;
      }

      // Show a confirmation with what will be imported
      const catCount = Array.isArray(parsed.categories) ? parsed.categories.length : 0;
      const txCount = Array.isArray(parsed.categories)
        ? parsed.categories.reduce((s, c) => s + (c.transactions?.length ?? 0), 0)
        : 0;
      const exportedAt = parsed.exportedAt
        ? new Date(parsed.exportedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : 'Unknown date';

      Alert.alert(
        'Replace All Data?',
        `This backup contains:\n• ${catCount} categories\n• ${txCount} transactions\n• Exported on: ${exportedAt}\n\nYour current data will be replaced. This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: () => {
              const err = importData(parsed);
              if (err) {
                Alert.alert('Import Failed', err);
              } else {
                Alert.alert(
                  '✅ Import Successful',
                  `Restored ${catCount} categories and ${txCount} transactions.`
                );
              }
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Import Failed', e.message);
    } finally {
      setImporting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>Data & Backup</Text>
        <Text style={styles.sub}>Export your data to a file or restore from a previous backup</Text>

        {/* Current data summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Current Data</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="folder-open-outline" size={22} color={colors.primary} />
              <Text style={styles.summaryValue}>{totalCategories}</Text>
              <Text style={styles.summaryLabel}>Categories</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Ionicons name="receipt-outline" size={22} color={colors.income} />
              <Text style={styles.summaryValue}>{totalTransactions}</Text>
              <Text style={styles.summaryLabel}>Transactions</Text>
            </View>
          </View>
        </View>

        {/* Export card */}
        <View style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <View style={[styles.actionIconBox, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Export Backup</Text>
              <Text style={styles.actionDesc}>
                Save a .budgetapp file to your device, Google Drive, WhatsApp, or any other app.
              </Text>
            </View>
          </View>

          {lastExportInfo && (
            <View style={styles.lastInfo}>
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.income} />
              <Text style={styles.lastInfoText}>
                Last export: {lastExportInfo.fileName} ({lastExportInfo.size}) at {lastExportInfo.time}
              </Text>
            </View>
          )}

          <Pressable
            style={[styles.btn, styles.exportBtn, exporting && styles.btnDisabled]}
            onPress={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="share-outline" size={18} color={colors.white} />
                <Text style={styles.btnText}>Export & Share</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Import card */}
        <View style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <View style={[styles.actionIconBox, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="cloud-download-outline" size={24} color={colors.warning} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Import Backup</Text>
              <Text style={styles.actionDesc}>
                Restore data from a .budgetapp file. Your current data will be replaced.
              </Text>
            </View>
          </View>

          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={14} color={colors.warning} />
            <Text style={styles.warningText}>
              Import replaces ALL existing categories and transactions. Export first if you want to keep your current data.
            </Text>
          </View>

          <Pressable
            style={[styles.btn, styles.importBtn, importing && styles.btnDisabled]}
            onPress={handleImport}
            disabled={importing}
          >
            {importing ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="folder-open-outline" size={18} color={colors.white} />
                <Text style={styles.btnText}>Select Backup File</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* How-to guide */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>💡 How to transfer to a new phone</Text>
          <View style={styles.guideSteps}>
            {[
              'On your old phone — tap "Export & Share"',
              'Send the .budgetapp file to yourself (WhatsApp, Email, Drive, etc.)',
              'On your new phone — install BudgetApp',
              'Open the file or come here and tap "Select Backup File"',
              'All your categories and transactions will be restored',
            ].map((step, i) => (
              <View key={i} style={styles.guideStep}>
                <View style={styles.guideStepNum}>
                  <Text style={styles.guideStepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.guideStepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 80 }} />
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
    padding: 16,
    paddingTop: 20,
    gap: 14,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  sub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -6,
    lineHeight: 18,
  },

  // ── Summary ──────────────────────────────────────────────────────────────
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  summaryTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },

  // ── Action cards ──────────────────────────────────────────────────────────
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  actionHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  actionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  actionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  lastInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.income + '14',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  lastInfoText: {
    fontSize: 11,
    color: colors.income,
    fontWeight: '500',
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: colors.warning + '14',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  warningText: {
    fontSize: 12,
    color: colors.warning,
    lineHeight: 17,
    flex: 1,
    fontWeight: '500',
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 13,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  exportBtn: {
    backgroundColor: colors.primary,
  },
  importBtn: {
    backgroundColor: colors.warning,
  },
  btnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // ── How-to guide ──────────────────────────────────────────────────────────
  guideCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  guideSteps: {
    gap: 10,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  guideStepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  guideStepNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  guideStepText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
