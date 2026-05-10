import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from '../context/BudgetContext';
import DateGroupedList from '../components/DateGroupedList';
import { colors } from '../theme/colors';

const FILTERS = ['All', 'Income', 'Expense'];

export default function TransactionsScreen() {
  const { transactions, deleteTransaction, activeCategory } = useBudget();
  const [filter, setFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState(null);

  const categoryName = activeCategory?.name ?? '';

  const filtered = transactions.filter((t) => {
    if (filter === 'All') return true;
    return t.type === filter.toLowerCase();
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <DateGroupedList
        transactions={filtered}
        onDelete={deleteTransaction}
        onDateFilter={setSelectedDate}
        selectedDate={selectedDate}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Transactions</Text>
                {categoryName ? (
                  <Text style={styles.categoryLabel}>{categoryName}</Text>
                ) : null}
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.count}>{filtered.length}</Text>
              </View>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {FILTERS.map((f) => (
                <Pressable
                  key={f}
                  onPress={() => {
                    setFilter(f);
                    setSelectedDate(null); // reset date filter when type changes
                  }}
                  style={[
                    styles.pill,
                    filter === f && styles.pillActive,
                  ]}
                >
                  <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  categoryLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  countBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  count: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: colors.white,
  },
  list: {
    paddingBottom: 100,
  },
});
