import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function TransactionCard({ transaction, onDelete, hideDate }) {
  const isIncome = transaction.type === 'income';
  const accentColor = isIncome ? colors.income : colors.expense;
  const sign = isIncome ? '+' : '-';
  const bgTint = isIncome ? colors.incomeLight : colors.expenseLight;

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: bgTint }]}>
        <Ionicons
          name={transaction.imageUri ? 'image-outline' : isIncome ? 'trending-up' : 'trending-down'}
          size={20}
          color={accentColor}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{transaction.title}</Text>
        {!hideDate && <Text style={styles.date}>{transaction.date}</Text>}
        {transaction.note ? (
          <Text style={styles.note} numberOfLines={1}>{transaction.note}</Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: accentColor }]}>
          {sign}₹{Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Pressable
          onPress={() => onDelete(transaction.id)}
          style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <Ionicons name="close" size={14} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.1,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
    fontWeight: '500',
  },
  note: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 10,
    gap: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  deleteBtn: {
    backgroundColor: colors.expenseLight,
    borderRadius: 8,
    padding: 5,
  },
});
