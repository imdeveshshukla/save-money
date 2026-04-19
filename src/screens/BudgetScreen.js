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
import { useBudget } from '../context/BudgetContext';
import { colors } from '../theme/colors';

export default function BudgetScreen() {
  const { budget, setBudget } = useBudget();
  const [input, setInput] = useState('');

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
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.container}>

        <Text style={styles.heading}>Monthly Budget</Text>
        <Text style={styles.sub}>Set how much you plan to spend this month</Text>

        {/* Current Budget Display */}
        <View style={styles.currentCard}>
          <Text style={styles.currentLabel}>Current Budget</Text>
          <Text style={styles.currentAmount}>
            {budget > 0
              ? `₹${Number(budget).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              : 'Not set'}
          </Text>
          {budget === 0 && (
            <Text style={styles.hint}>Enter a budget below to get started</Text>
          )}
        </View>

        {/* Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>New Budget Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 30000"
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            keyboardType="decimal-pad"
          />
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>💾  Save Budget</Text>
          </Pressable>
        </View>

        {/* Why Budget section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How it works</Text>
          <Text style={styles.infoText}>
            Your budget is used to track spending. Expenses are compared against this limit and shown as a progress bar on the dashboard.
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
    paddingTop: 28,
    gap: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  sub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -12,
  },
  currentCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  currentLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  currentAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.white,
  },
  hint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  inputSection: {
    gap: 10,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
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
    lineHeight: 20,
  },
});
