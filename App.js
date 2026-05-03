import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useShareIntent } from 'expo-share-intent';

import { BudgetProvider } from './src/context/BudgetContext';
import { colors } from './src/theme/colors';

import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import UploadScreen from './src/screens/UploadScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import DataScreen from './src/screens/DataScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ICONS = {
  Dashboard: ['home', 'home-outline'],
  Transactions: ['list', 'list-outline'],
  Budget: ['wallet', 'wallet-outline'],
  Upload: ['camera', 'camera-outline'],
  Categories: ['folder', 'folder-outline'],
  Data: ['server', 'server-outline'],
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090B',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 10,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name] || ['apps', 'apps-outline'];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Data" component={DataScreen} />
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
      shareIntent?.value ||
      shareIntent?.files?.[0]?.path ||
      shareIntent?.files?.[0]?.uri;

    if (hasShareIntent && sharedImageUri) {
      setPendingShareUri(sharedImageUri);
      resetShareIntent(); // clear immediately so it doesn't fire again on re-render
    }
  }, [hasShareIntent, shareIntent]);

  // Step 2 – navigate once BOTH the URI and the navigator are ready
  useEffect(() => {
    if (isNavigationReady && pendingShareUri && navigationRef.current) {
      navigationRef.current.navigate('Main', {
        screen: 'Upload',
        params: { sharedImageUri: pendingShareUri },
      });
      setPendingShareUri(null);
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
                  headerTitle: '',
                  headerStyle: { backgroundColor: colors.background },
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
