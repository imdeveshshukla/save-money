import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from '../context/BudgetContext';
import { colors } from '../theme/colors';

const MENU_ITEMS = [
  {
    id: 'budget',
    title: 'Set Budget',
    subtitle: 'Define your monthly spending limit',
    icon: 'wallet-outline',
    screen: 'Budget',
    color: colors.primary,
  },
  {
    id: 'categories',
    title: 'Categories',
    subtitle: 'Organize your expenses by groups',
    icon: 'folder-outline',
    screen: 'Categories',
    color: '#6366F1',
  },
  {
    id: 'data',
    title: 'Backup & Restore',
    subtitle: 'Export or import your data',
    icon: 'cloud-outline',
    screen: 'Data',
    color: '#F0A500',
  },
];

export default function SettingsScreen({ navigation }) {
  const { activeCategory, categories } = useBudget();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>More</Text>
        <Text style={styles.sub}>Manage your budget, categories & data</Text>

        {/* Active Category Banner */}
        <View style={styles.categoryBanner}>
          <View style={styles.categoryIcon}>
            <Ionicons name="folder-open" size={20} color={colors.primary} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryLabel}>Active Category</Text>
            <Text style={styles.categoryName}>
              {activeCategory?.name ?? 'None'}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {categories.length} total
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View
                style={[
                  styles.menuIconBox,
                  { backgroundColor: item.color + '14' },
                ]}
              >
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>BudgetApp</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 20,
    paddingTop: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  // Category Banner
  categoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  // Menu
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemPressed: {
    backgroundColor: colors.surfaceLight,
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // App Info
  appInfo: {
    alignItems: 'center',
    paddingTop: 32,
    gap: 2,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  appVersion: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
