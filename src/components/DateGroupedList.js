import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TransactionCard from './TransactionCard';
import { colors } from '../theme/colors';

// ── Date formatting helpers ──────────────────────────────────────────────────
function parseDate(dateStr) {
  // Handle YYYY-MM-DD format
  const parts = dateStr?.split('-');
  if (!parts || parts.length !== 3) return new Date(dateStr || 0);
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function formatDateLabel(dateStr) {
  const d = parseDate(dateStr);
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
    year: today.getFullYear() !== d.getFullYear() ? 'numeric' : undefined,
  });
}

function getDayTotal(transactions) {
  let income = 0;
  let expense = 0;
  transactions.forEach((t) => {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  });
  return { income, expense };
}

// ── Main component ──────────────────────────────────────────────────────────
export default function DateGroupedList({
  transactions,
  onDelete,
  onDateFilter,
  selectedDate,
  ListHeaderComponent,
  contentContainerStyle,
}) {
  // Group transactions by date
  const sections = useMemo(() => {
    const groups = {};
    const list = selectedDate
      ? transactions.filter((t) => t.date === selectedDate)
      : transactions;

    list.forEach((t) => {
      const key = t.date || 'Unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    // Sort dates descending (newest first)
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        title: date,
        label: formatDateLabel(date),
        totals: getDayTotal(groups[date]),
        data: groups[date],
      }));
  }, [transactions, selectedDate]);

  // Get unique dates for date filter chips
  const uniqueDates = useMemo(() => {
    const dates = [...new Set(transactions.map((t) => t.date))];
    return dates.sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ paddingBottom: 100 }, contentContainerStyle]}
      ListHeaderComponent={
        <>
          {ListHeaderComponent}
          {/* Date filter chips */}
          {uniqueDates.length > 1 && (
            <View style={styles.dateChipsContainer}>
              <Pressable
                style={[
                  styles.dateChip,
                  !selectedDate && styles.dateChipActive,
                ]}
                onPress={() => onDateFilter?.(null)}
              >
                <Text
                  style={[
                    styles.dateChipText,
                    !selectedDate && styles.dateChipTextActive,
                  ]}
                >
                  All Days
                </Text>
              </Pressable>
              {uniqueDates.slice(0, 7).map((date) => (
                <Pressable
                  key={date}
                  style={[
                    styles.dateChip,
                    selectedDate === date && styles.dateChipActive,
                  ]}
                  onPress={() =>
                    onDateFilter?.(selectedDate === date ? null : date)
                  }
                >
                  <Text
                    style={[
                      styles.dateChipText,
                      selectedDate === date && styles.dateChipTextActive,
                    ]}
                  >
                    {formatDateLabel(date)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLeft}>
            <View style={styles.dateDot} />
            <Text style={styles.sectionDate}>{section.label}</Text>
            <Text style={styles.sectionCount}>
              {section.data.length} {section.data.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
          <View style={styles.sectionRight}>
            {section.totals.income > 0 && (
              <Text style={styles.sectionIncome}>
                +₹{Number(section.totals.income).toLocaleString('en-IN')}
              </Text>
            )}
            {section.totals.expense > 0 && (
              <Text style={styles.sectionExpense}>
                -₹{Number(section.totals.expense).toLocaleString('en-IN')}
              </Text>
            )}
          </View>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <TransactionCard
            transaction={item}
            onDelete={onDelete}
            hideDate
          />
        </View>
      )}
      SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="receipt-outline" size={32} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyText}>No transactions found</Text>
          {selectedDate && (
            <Pressable
              style={styles.clearFilterBtn}
              onPress={() => onDateFilter?.(null)}
            >
              <Text style={styles.clearFilterText}>Clear date filter</Text>
            </Pressable>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  // Date filter chips
  dateChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dateChipTextActive: {
    color: colors.white,
  },
  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  sectionDate: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
  },
  sectionRight: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  sectionIncome: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.income,
  },
  sectionExpense: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.expense,
  },
  itemContainer: {
    paddingHorizontal: 20,
  },
  sectionSeparator: {
    height: 8,
  },
  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
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
  clearFilterBtn: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
  },
  clearFilterText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
