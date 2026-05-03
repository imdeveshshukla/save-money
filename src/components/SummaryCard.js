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
      <View style={[styles.iconBox, { backgroundColor: amountColor + '22' }]}>
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
    borderRadius: 20,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
