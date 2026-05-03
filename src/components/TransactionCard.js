import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/colors';

export default function TransactionCard({ transaction, onDelete }) {
  const isIncome = transaction.type === 'income';
  const accentColor = isIncome ? colors.income : colors.expense;
  const sign = isIncome ? '+' : '-';
  const bgTint = isIncome ? colors.income + '10' : colors.expense + '10';

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: bgTint }]}>
        <Text style={styles.icon}>{transaction.imageUri ? '🖼️' : isIncome ? '💰' : '💸'}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{transaction.title}</Text>
        <Text style={styles.date}>{transaction.date}</Text>
        {transaction.note ? (
          <Text style={styles.note} numberOfLines={1}>{transaction.note}</Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: accentColor }]}>
          {sign}₹{Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Pressable onPress={() => onDelete(transaction.id)} style={styles.deleteBtn} hitSlop={8}>
          <Text style={styles.deleteText}>✕</Text>
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
    borderRadius: 20,
    marginBottom: 12,
    padding: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.2,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    fontWeight: '500',
  },
  note: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 12,
    gap: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  deleteBtn: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
});
