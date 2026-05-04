import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from '../context/BudgetContext';
import { colors } from '../theme/colors';

export default function BudgetScreen() {
  const { budget, setBudget, activeCategory } = useBudget();
  const [input, setInput] = useState('');

  const categoryName = activeCategory?.name ?? 'Category';

  function handleSave() {
    const num = parseFloat(input);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount.');
      return;
    }
    setBudget(num);
    setInput('');
    Alert.alert('Success', `Monthly budget set to ₹${num.toLocaleString('en-IN')}`);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>

        {/* Current Budget Display */}
        <View style={styles.currentCard}>
          <View style={styles.currentIconBox}>
            <Ionicons name="wallet" size={28} color={colors.primary} />
          </View>
          <Text style={styles.currentLabel}>Current Budget</Text>
          <Text style={styles.currentAmount}>
            {budget > 0
              ? `₹${Number(budget).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              : 'Not set'}
          </Text>
          <Text style={styles.currentCategory}>{categoryName}</Text>
          {budget === 0 && (
            <Text style={styles.hint}>Enter a budget below to get started</Text>
          )}
        </View>

        {/* Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>New Budget Amount</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="30,000"
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              keyboardType="decimal-pad"
            />
          </View>
          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
            onPress={handleSave}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
            <Text style={styles.saveBtnText}>Save Budget</Text>
          </Pressable>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            Your budget tracks spending. Expenses are compared against this limit and shown as a progress bar on the dashboard.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  // Current Budget Card
  currentCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  currentLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  currentAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
  },
  currentCategory: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  // Input
  inputSection: {
    gap: 10,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMuted,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
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
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
