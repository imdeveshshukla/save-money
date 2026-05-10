import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from '../context/BudgetContext';
import { colors } from '../theme/colors';
import CalculatorInput from '../components/CalculatorInput';
import DatePickerModal from '../components/DatePickerModal';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDisplayDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) return 'Today';

  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AddTransactionScreen({ navigation }) {
  const { addTransaction, activeCategory } = useBudget();

  const categoryName = activeCategory?.name ?? 'Default';

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayString());
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAmountChange = useCallback((val) => {
    setAmount(val);
  }, []);

  function evaluateAmount(expr) {
    // Safe evaluation for + and - only
    const cleaned = expr.replace(/\s/g, '');
    if (!cleaned) return 0;
    const tokens = [];
    let current = '';
    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if ((ch === '+' || ch === '-') && current.length > 0) {
        tokens.push(parseFloat(current));
        tokens.push(ch);
        current = '';
      } else {
        current += ch;
      }
    }
    if (current) tokens.push(parseFloat(current));
    if (tokens.length === 0) return 0;
    let result = typeof tokens[0] === 'number' ? tokens[0] : 0;
    for (let i = 1; i < tokens.length; i += 2) {
      const op = tokens[i];
      const num = typeof tokens[i + 1] === 'number' ? tokens[i + 1] : 0;
      if (op === '+') result += num;
      else if (op === '-') result -= num;
    }
    return isNaN(result) ? 0 : Math.round(result * 100) / 100;
  }

  function handleSave() {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title.');
      return;
    }

    // Resolve any expression in the amount field
    const amtNum = evaluateAmount(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      Alert.alert('Validation', 'Please enter a valid amount.');
      return;
    }

    addTransaction({
      id: generateId(),
      type,
      title: title.trim(),
      amount: amtNum,
      date,
      note: note.trim(),
      imageUri: null,
    });

    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Category tag */}
        <View style={styles.categoryTag}>
          <Ionicons name="folder-outline" size={14} color={colors.primary} />
          <Text style={styles.categoryLabel}>{categoryName}</Text>
        </View>

        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          {['expense', 'income'].map((t) => {
            const isActive = type === t;
            const activeColor = t === 'income' ? colors.income : colors.expense;
            return (
              <Pressable
                key={t}
                style={[
                  styles.typeBtn,
                  isActive && { backgroundColor: activeColor, borderColor: activeColor },
                ]}
                onPress={() => setType(t)}
              >
                <Ionicons
                  name={t === 'income' ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={isActive ? colors.white : colors.textMuted}
                />
                <Text style={[styles.typeBtnText, isActive && styles.typeBtnTextActive]}>
                  {t === 'income' ? 'Income' : 'Expense'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Grocery, Salary..."
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Calculator-style Amount Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Amount</Text>
            <CalculatorInput
              value={amount}
              onValueChange={handleAmountChange}
            />
          </View>

          {/* Date Picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Date</Text>
            <Pressable
              style={({ pressed }) => [styles.dateBtn, pressed && { backgroundColor: colors.surfaceLight }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={styles.dateBtnText}>
                {formatDisplayDate(date)}
              </Text>
              <Text style={styles.dateBtnRaw}>{date}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="Add a note..."
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.8 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
            onPress={handleSave}
          >
            <Ionicons name="checkmark" size={18} color={colors.white} />
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={date}
        onSelectDate={setDate}
        onClose={() => setShowDatePicker(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 20,
  },
  categoryLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  typeBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  typeBtnTextActive: {
    color: colors.white,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Date button (replaces text input)
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBtnText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  dateBtnRaw: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  saveText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
