import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function SummaryCard({ title, amount, type, icon }) {
  const isIncome = type === 'income';
  const isExpense = type === 'expense';

  const amountColor = isIncome
    ? colors.income
    : isExpense
    ? colors.expense
    : colors.primary;

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: amountColor + '14' }]}>
        <Text style={[styles.icon, { color: amountColor }]}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.amount, { color: amountColor }]}>
        ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    flex: 1,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
