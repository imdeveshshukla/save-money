import React from 'react';
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

  const recentTransactions = transactions.slice(0, 5);
  const categoryName = activeCategory?.name ?? 'No Category';

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <View style={styles.categoryPill}>
            <Ionicons name="folder-open-outline" size={12} color={colors.primary} />
            <Text style={styles.categoryPillText}>Active Category</Text>
          </View>
          <Text style={styles.month} numberOfLines={1}>{categoryName}</Text>
        </View>
        <Pressable
          style={styles.setBudgetBtn}
          onPress={() => navigation.navigate('Budget')}
        >
          <Text style={styles.setBudgetText}>Set Budget</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Remaining Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Remaining Balance</Text>
          <Text style={[styles.balanceAmount, { color: remaining >= 0 ? colors.income : colors.expense }]}>
            ₹{Number(remaining).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          {budget === 0 && (
            <Text style={styles.noBudget}>Set a monthly budget to get started →</Text>
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

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length > 5 && (
            <Pressable onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          )}
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubText}>Tap + to add your first entry</Text>
          </View>
        ) : (
          recentTransactions.map((t) => (
            <TransactionCard key={t.id} transaction={t} onDelete={deleteTransaction} />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Text style={styles.fabIcon}>＋</Text>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  categoryPillText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  month: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  setBudgetBtn: {
    backgroundColor: colors.primary + '22',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  setBudgetText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
  },
  noBudget: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  fabIcon: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 32,
  },
});
