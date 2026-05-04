import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from '../context/BudgetContext';
import { colors } from '../theme/colors';

function formatAmount(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function CategoriesScreen() {
  const {
    categories,
    activeCategoryId,
    addCategory,
    renameCategory,
    deleteCategory,
    setActiveCategory,
  } = useBudget();

  const [modalVisible, setModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [inputName, setInputName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  // ── Create ────────────────────────────────────────────────────────────────
  function handleCreate() {
    const name = inputName.trim();
    if (!name) {
      Alert.alert('Name required', 'Please enter a category name.');
      return;
    }
    addCategory(name);
    setInputName('');
    setModalVisible(false);
  }

  // ── Rename ────────────────────────────────────────────────────────────────
  function openRename(cat) {
    setEditingCategory(cat);
    setInputName(cat.name);
    setRenameModalVisible(true);
  }

  function handleRename() {
    const name = inputName.trim();
    if (!name) {
      Alert.alert('Name required', 'Please enter a category name.');
      return;
    }
    renameCategory(editingCategory.id, name);
    setInputName('');
    setRenameModalVisible(false);
    setEditingCategory(null);
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  function handleDelete(cat) {
    if (categories.length <= 1) {
      Alert.alert('Cannot delete', 'You need at least one category.');
      return;
    }
    Alert.alert(
      'Delete Category',
      `Delete "${cat.name}"? All its transactions will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(cat.id),
        },
      ]
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  function renderCategory({ item }) {
    const isActive = item.id === activeCategoryId;
    const expense = item.transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const income = item.transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const txCount = item.transactions.length;

    return (
      <Pressable
        style={[styles.card, isActive && styles.cardActive]}
        onPress={() => setActiveCategory(item.id)}
      >
        <View style={styles.cardBody}>
          {/* Top row */}
          <View style={styles.cardTop}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.statusDot, isActive && styles.statusDotActive]} />
              <Text style={[styles.cardName, isActive && styles.cardNameActive]} numberOfLines={1}>
                {item.name}
              </Text>
              {isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              )}
            </View>
            <View style={styles.cardActions}>
              <Pressable
                hitSlop={8}
                onPress={() => openRename(item)}
                style={styles.iconBtn}
              >
                <Ionicons name="pencil-outline" size={15} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                hitSlop={8}
                onPress={() => handleDelete(item)}
                style={styles.iconBtn}
              >
                <Ionicons name="trash-outline" size={15} color={colors.danger} />
              </Pressable>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Budget</Text>
              <Text style={styles.statValue}>
                {item.budget > 0 ? formatAmount(item.budget) : '—'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: colors.income }]}>Income</Text>
              <Text style={[styles.statValue, { color: colors.income }]}>
                {income > 0 ? formatAmount(income) : '—'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: colors.expense }]}>Spent</Text>
              <Text style={[styles.statValue, { color: colors.expense }]}>
                {expense > 0 ? formatAmount(expense) : '—'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Txns</Text>
              <Text style={styles.statValue}>{txCount}</Text>
            </View>
          </View>

          {/* Progress bar (if budget set) */}
          {item.budget > 0 && (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((expense / item.budget) * 100, 100)}%`,
                    backgroundColor:
                      expense > item.budget ? colors.danger : colors.primary,
                  },
                ]}
              />
            </View>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Subheader with create button */}
      <View style={styles.subHeader}>
        <Text style={styles.headerSub}>{categories.length} categories</Text>
        <Pressable
          style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.85 }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.createBtnText}>New</Text>
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="folder-open-outline" size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyText}>No categories yet</Text>
            <Text style={styles.emptySub}>Tap "New" to create your first category</Text>
          </View>
        }
      />

      {/* ── Create Modal ──────────────────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Category</Text>
            <Text style={styles.modalSub}>
              Give it a name like "May 2026" or "Trip to Goa"
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Category name"
              placeholderTextColor={colors.textMuted}
              value={inputName}
              onChangeText={setInputName}
              autoFocus
              onSubmitEditing={handleCreate}
              returnKeyType="done"
            />
            <View style={styles.modalBtnRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => {
                  setInputName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalCreateBtn} onPress={handleCreate}>
                <Text style={styles.modalCreateText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Rename Modal ──────────────────────────────────────────────────────── */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setRenameModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Rename Category</Text>
            <Text style={styles.modalSub}>
              Update the name for "{editingCategory?.name}"
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="New name"
              placeholderTextColor={colors.textMuted}
              value={inputName}
              onChangeText={setInputName}
              autoFocus
              onSubmitEditing={handleRename}
              returnKeyType="done"
            />
            <View style={styles.modalBtnRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => {
                  setInputName('');
                  setRenameModalVisible(false);
                  setEditingCategory(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalCreateBtn} onPress={handleRename}>
                <Text style={styles.modalCreateText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerSub: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  createBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 12,
  },
  // ── Category Card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActive: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  statusDotActive: {
    backgroundColor: colors.primary,
  },
  activeBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  activeBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    flex: 1,
  },
  cardNameActive: {
    color: colors.text,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 7,
  },
  // ── Stats ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  // ── Progress ─────────────────────────────────────────────────────────────
  progressTrack: {
    height: 5,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  // ── Empty ─────────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
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
    fontWeight: '700',
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
  },
  // ── Modal ─────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    gap: 14,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -6,
  },
  modalInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  modalCreateBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  modalCreateText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
