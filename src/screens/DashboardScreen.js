import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Pressable,
} from 'react-native';
import { useBudget } from '../context/BudgetContext';
import SummaryCard from '../components/SummaryCard';
import BudgetProgressBar from '../components/BudgetProgressBar';
import TransactionCard from '../components/TransactionCard';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

// ── Date helpers (same as DateGroupedList) ──────────────────────────────────
function formatDateLabel(dateStr) {
  const parts = dateStr?.split('-');
  if (!parts || parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function DashboardScreen({ navigation }) {
  const {
    budget,
    totalIncome,
    totalExpense,
    remaining,
    transactions,
    deleteTransaction,
    loading,
    activeCategory,
  } = useBudget();

  const recentTransactions = transactions.slice(0, 8);
  const categoryName = activeCategory?.name ?? 'No Category';

  // Group recent transactions by date
  const recentGroups = useMemo(() => {
    const groups = {};
    recentTransactions.forEach((t) => {
      const key = t.date || 'Unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        label: formatDateLabel(date),
        transactions: groups[date],
      }));
  }, [recentTransactions]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.greeting}>Hello 👋</Text>
          <Text style={styles.categoryName} numberOfLines={1}>{categoryName}</Text>
        </View>
        <Pressable
          style={styles.setBudgetBtn}
          onPress={() => navigation.navigate('Budget')}
        >
          <Ionicons name="wallet-outline" size={16} color={colors.primary} />
          <Text style={styles.setBudgetText}>Budget</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Remaining Balance</Text>
          <Text style={[styles.balanceAmount, remaining < 0 && { color: colors.expense }]}>
            ₹{Number(Math.abs(remaining)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          {remaining < 0 && (
            <Text style={styles.overspent}>Over budget</Text>
          )}
          {budget === 0 && (
            <Text style={styles.noBudget}>Set a monthly budget to get started</Text>
          )}
        </View>

        {/* Budget Progress */}
        <BudgetProgressBar spent={totalExpense} budget={budget} />

        {/* Summary Cards */}
        <View style={styles.cardsRow}>
          <SummaryCard title="Budget" amount={budget} type="primary" icon="🎯" />
          <SummaryCard title="Income" amount={totalIncome} type="income" icon="💰" />
          <SummaryCard title="Expense" amount={totalExpense} type="expense" icon="💸" />
        </View>

        {/* Recent Transactions (Date Grouped) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent</Text>
          {transactions.length > 8 && (
            <Pressable onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          )}
        </View>

        {recentGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="receipt-outline" size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubText}>Tap + to add your first entry</Text>
          </View>
        ) : (
          recentGroups.map((group) => (
            <View key={group.date}>
              {/* Date separator */}
              <View style={styles.dateSeparator}>
                <View style={styles.dateDot} />
                <Text style={styles.dateLabel}>{group.label}</Text>
                <View style={styles.dateLine} />
              </View>
              {/* Transactions for this date */}
              {group.transactions.map((t) => (
                <TransactionCard
                  key={t.id}
                  transaction={t}
                  onDelete={deleteTransaction}
                  hideDate
                />
              ))}
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  setBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  setBudgetText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  // Balance Card
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  overspent: {
    color: '#FEE2E2',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  noBudget: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 8,
  },
  // Cards
  cardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  // Date separator
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  dateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 4,
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
