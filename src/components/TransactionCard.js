import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/colors';

export default function TransactionCard({ transaction, onDelete }) {
  const isIncome = transaction.type === 'income';
  const accentColor = isIncome ? colors.income : colors.expense;
  const sign = isIncome ? '+' : '-';

  return (
    <View style={styles.card}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.iconBox}>
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
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    paddingVertical: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  note: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  right: {
    alignItems: 'flex-end',
    paddingRight: 12,
    paddingVertical: 12,
    gap: 6,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: colors.danger + '22',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
});
