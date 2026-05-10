import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function BudgetProgressBar({ spent, budget }) {
  const ratio = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const percent = Math.round(ratio * 100);

  const barColor =
    percent >= 100
      ? colors.expense
      : percent >= 75
      ? colors.warning
      : colors.income;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Budget Usage</Text>
        <Text style={[styles.percent, { color: barColor }]}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${ratio * 100}%`, backgroundColor: barColor },
          ]}
        />
      </View>
      <View style={styles.subRow}>
        <Text style={styles.sub}>
          Spent: ₹{Number(spent).toLocaleString('en-IN')}
        </Text>
        <Text style={styles.sub}>
          Budget: ₹{Number(budget).toLocaleString('en-IN')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  percent: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    height: 10,
    backgroundColor: colors.surfaceLight,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
