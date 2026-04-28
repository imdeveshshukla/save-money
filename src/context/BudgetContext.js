import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BudgetContext = createContext();

const STORAGE_KEY = '@budget_v2_data';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Shape of a category:
 * {
 *   id: string,
 *   name: string,
 *   budget: number,
 *   transactions: Transaction[],
 * }
 */

const DEFAULT_CATEGORY = {
  id: 'default',
  name: 'April 2026',
  budget: 0,
  transactions: [],
};

const initialState = {
  categories: [DEFAULT_CATEGORY],
  activeCategoryId: 'default',
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload, loading: false };

    // ── Category CRUD ──────────────────────────────────────────────────────────
    case 'ADD_CATEGORY': {
      return { ...state, categories: [...state.categories, action.payload] };
    }

    case 'RENAME_CATEGORY': {
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? { ...c, name: action.payload.name } : c
        ),
      };
    }

    case 'DELETE_CATEGORY': {
      const remaining = state.categories.filter((c) => c.id !== action.payload);
      // If we deleted the active one, switch to first remaining
      const newActiveId =
        state.activeCategoryId === action.payload
          ? remaining[0]?.id ?? null
          : state.activeCategoryId;
      return { ...state, categories: remaining, activeCategoryId: newActiveId };
    }

    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategoryId: action.payload };

    // ── Budget per category ────────────────────────────────────────────────────
    case 'SET_BUDGET': {
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.categoryId
            ? { ...c, budget: action.payload.amount }
            : c
        ),
      };
    }

    // ── Transactions per category ──────────────────────────────────────────────
    case 'ADD_TRANSACTION': {
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.categoryId
            ? { ...c, transactions: [action.payload.transaction, ...c.transactions] }
            : c
        ),
      };
    }

    case 'DELETE_TRANSACTION': {
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.categoryId
            ? {
                ...c,
                transactions: c.transactions.filter((t) => t.id !== action.payload.transactionId),
              }
            : c
        ),
      };
    }

    default:
      return state;
  }
}

export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load on mount
  useEffect(() => {
    loadData();
  }, []);

  // Persist whenever relevant state changes
  useEffect(() => {
    if (!state.loading) {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          categories: state.categories,
          activeCategoryId: state.activeCategoryId,
        })
      );
    }
  }, [state.categories, state.activeCategoryId, state.loading]);

  async function loadData() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: 'LOAD_DATA', payload: parsed });
      } else {
        // Try to migrate from old storage format
        const [oldBudget, oldTransactions] = await Promise.all([
          AsyncStorage.getItem('@budget_monthly'),
          AsyncStorage.getItem('@budget_transactions'),
        ]);
        const migratedCategory = {
          ...DEFAULT_CATEGORY,
          budget: oldBudget ? JSON.parse(oldBudget) : 0,
          transactions: oldTransactions ? JSON.parse(oldTransactions) : [],
        };
        dispatch({
          type: 'LOAD_DATA',
          payload: { categories: [migratedCategory], activeCategoryId: 'default' },
        });
      }
    } catch (e) {
      dispatch({
        type: 'LOAD_DATA',
        payload: { categories: [DEFAULT_CATEGORY], activeCategoryId: 'default' },
      });
    }
  }

  // ── Helpers that resolve the active category ─────────────────────────────────
  const activeCategory =
    state.categories.find((c) => c.id === state.activeCategoryId) ||
    state.categories[0] ||
    null;

  // ── Public API ───────────────────────────────────────────────────────────────
  function addCategory(name) {
    const cat = { id: generateId(), name, budget: 0, transactions: [] };
    dispatch({ type: 'ADD_CATEGORY', payload: cat });
    dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: cat.id });
    return cat;
  }

  function renameCategory(id, name) {
    dispatch({ type: 'RENAME_CATEGORY', payload: { id, name } });
  }

  function deleteCategory(id) {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  }

  function setActiveCategory(id) {
    dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: id });
  }

  function setBudget(amount, categoryId) {
    const targetId = categoryId ?? state.activeCategoryId;
    dispatch({ type: 'SET_BUDGET', payload: { categoryId: targetId, amount: Number(amount) } });
  }

  function addTransaction(transaction, categoryId) {
    const targetId = categoryId ?? state.activeCategoryId;
    dispatch({ type: 'ADD_TRANSACTION', payload: { categoryId: targetId, transaction } });
  }

  function deleteTransaction(transactionId, categoryId) {
    const targetId = categoryId ?? state.activeCategoryId;
    dispatch({ type: 'DELETE_TRANSACTION', payload: { categoryId: targetId, transactionId } });
  }

  // ── Derived values for the ACTIVE category ───────────────────────────────────
  const transactions = activeCategory?.transactions ?? [];
  const budget = activeCategory?.budget ?? 0;

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = budget + totalIncome - totalExpense;
  const budgetUsagePercent = budget > 0 ? Math.min(totalExpense / budget, 1) : 0;

  return (
    <BudgetContext.Provider
      value={{
        // raw state
        categories: state.categories,
        activeCategoryId: state.activeCategoryId,
        activeCategory,
        loading: state.loading,

        // category actions
        addCategory,
        renameCategory,
        deleteCategory,
        setActiveCategory,

        // per-active-category derived
        budget,
        transactions,
        totalIncome,
        totalExpense,
        remaining,
        budgetUsagePercent,

        // scoped actions (default to active category)
        setBudget,
        addTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used inside BudgetProvider');
  return ctx;
}
