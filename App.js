import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useShareIntent } from 'expo-share-intent';
import { View, Platform } from 'react-native';

import { BudgetProvider } from './src/context/BudgetContext';
import { colors } from './src/theme/colors';

import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import UploadScreen from './src/screens/UploadScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import DataScreen from './src/screens/DataScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ICONS = {
  Home: ['home', 'home-outline'],
  Transactions: ['receipt', 'receipt-outline'],
  Scan: ['scan', 'scan-outline'],
  More: ['grid', 'grid-outline'],
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 88 : 68,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name] || ['apps', 'apps-outline'];
          return <Ionicons name={focused ? active : inactive} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Scan" component={UploadScreen} />
      <Tab.Screen name="More" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const navigationRef = useRef(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  // Capture the shared URI as soon as expo-share-intent provides it.
  // On cold start the intent is parsed asynchronously AFTER navigation is
  // already ready, so we must store the URI separately and let a second
  // effect handle the actual navigation.
  const [pendingShareUri, setPendingShareUri] = useState(null);

  // Step 1 – capture URI the moment expo-share-intent makes it available
  useEffect(() => {
    const sharedImageUri =
      shareIntent?.files?.[0]?.path ||
      shareIntent?.files?.[0]?.uri ||
      shareIntent?.value;

    if (hasShareIntent && sharedImageUri) {
      // Append timestamp to make each share event unique
      setPendingShareUri(sharedImageUri);
      resetShareIntent(); // clear immediately so it doesn't fire again on re-render
    }
  }, [hasShareIntent, shareIntent]);

  // Step 2 – navigate once BOTH the URI and the navigator are ready
  useEffect(() => {
    if (isNavigationReady && pendingShareUri && navigationRef.current) {
      // Small delay to ensure tab screens are fully mounted (especially on cold start)
      const timer = setTimeout(() => {
        navigationRef.current.navigate('Main', {
          screen: 'Scan',
          params: { sharedImageUri: pendingShareUri },
        });
        setPendingShareUri(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isNavigationReady, pendingShareUri]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <BudgetProvider>
          <NavigationContainer
            ref={navigationRef}
            onReady={() => setIsNavigationReady(true)}
          >
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen
                name="AddTransaction"
                component={AddTransactionScreen}
                options={{
                  presentation: 'modal',
                  headerShown: true,
                  headerTitle: 'Add Entry',
                  headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 17,
                    color: colors.text,
                  },
                  headerStyle: {
                    backgroundColor: colors.background,
                    elevation: 0,
                    shadowOpacity: 0,
                  },
                  headerTintColor: colors.primary,
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name="Budget"
                component={BudgetScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Set Budget',
                  headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 17,
                    color: colors.text,
                  },
                  headerStyle: {
                    backgroundColor: colors.background,
                    elevation: 0,
                    shadowOpacity: 0,
                  },
                  headerTintColor: colors.primary,
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Categories',
                  headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 17,
                    color: colors.text,
                  },
                  headerStyle: {
                    backgroundColor: colors.background,
                    elevation: 0,
                    shadowOpacity: 0,
                  },
                  headerTintColor: colors.primary,
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name="Data"
                component={DataScreen}
                options={{
                  headerShown: true,
                  headerTitle: 'Backup & Restore',
                  headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 17,
                    color: colors.text,
                  },
                  headerStyle: {
                    backgroundColor: colors.background,
                    elevation: 0,
                    shadowOpacity: 0,
                  },
                  headerTintColor: colors.primary,
                  headerShadowVisible: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </BudgetProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
