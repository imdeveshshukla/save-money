import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function parseYMD(dateStr) {
  const parts = dateStr.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10) - 1, // 0-indexed
    day: parseInt(parts[2], 10),
  };
}

function toYMD(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function DatePickerModal({ visible, onClose, selectedDate, onSelectDate }) {
  const parsed = useMemo(() => parseYMD(selectedDate), [selectedDate]);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  const todayStr = useMemo(() => {
    const d = new Date();
    return toYMD(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  // Build calendar grid
  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const cells = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      cells.push({ key: `empty-${i}`, empty: true });
    }
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toYMD(viewYear, viewMonth, d);
      cells.push({
        key: dateStr,
        day: d,
        dateStr,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
      });
    }
    return cells;
  }, [viewYear, viewMonth, selectedDate, todayStr]);

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function selectToday() {
    const d = new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    onSelectDate(toYMD(d.getFullYear(), d.getMonth(), d.getDate()));
    onClose();
  }

  function handleDayPress(dateStr) {
    onSelectDate(dateStr);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Date</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Month/Year Navigation */}
          <View style={styles.monthNav}>
            <Pressable onPress={goToPrevMonth} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.monthLabel}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <Pressable onPress={goToNextMonth} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </Pressable>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekRow}>
            {WEEKDAYS.map((day) => (
              <View key={day} style={styles.weekCell}>
                <Text style={styles.weekText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.grid}>
            {calendarData.map((cell) => {
              if (cell.empty) {
                return <View key={cell.key} style={styles.dayCell} />;
              }
              return (
                <Pressable
                  key={cell.key}
                  style={[
                    styles.dayCell,
                    cell.isSelected && styles.dayCellSelected,
                    cell.isToday && !cell.isSelected && styles.dayCellToday,
                  ]}
                  onPress={() => handleDayPress(cell.dateStr)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      cell.isSelected && styles.dayTextSelected,
                      cell.isToday && !cell.isSelected && styles.dayTextToday,
                    ]}
                  >
                    {cell.day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            <Pressable
              style={({ pressed }) => [styles.todayBtn, pressed && { opacity: 0.8 }]}
              onPress={selectToday}
            >
              <Ionicons name="today-outline" size={14} color={colors.primary} />
              <Text style={styles.todayBtnText}>Today</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  // Month navigation
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  // Weekday row
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  // Calendar grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  dayCellToday: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  dayTextToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  // Quick actions
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  todayBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
