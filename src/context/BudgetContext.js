import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BudgetContext = createContext();

const STORAGE_KEYS = {
  BUDGET: '@budget_monthly',
  TRANSACTIONS: '@budget_transactions',
  SELECTED_MONTH: '@budget_selected_month',
};

const initialState = {
  budget: 0,
  transactions: [],
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload, loading: false };

    case 'SET_BUDGET':
      return { ...state, budget: action.payload };

    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };

    default:
      return state;
  }
}

export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadData();
  }, []);

  // Persist whenever transactions or budget changes
  useEffect(() => {
    if (!state.loading) {
      AsyncStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(state.budget));
      AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
    }
  }, [state.budget, state.transactions, state.loading]);

  async function loadData() {
    try {
      const [budgetStr, transactionsStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BUDGET),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
      ]);
      dispatch({
        type: 'LOAD_DATA',
        payload: {
          budget: budgetStr ? JSON.parse(budgetStr) : 0,
          transactions: transactionsStr ? JSON.parse(transactionsStr) : [],
        },
      });
    } catch (e) {
      dispatch({ type: 'LOAD_DATA', payload: { budget: 0, transactions: [] } });
    }
  }

  function setBudget(amount) {
    dispatch({ type: 'SET_BUDGET', payload: Number(amount) });
  }

  function addTransaction(transaction) {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  }

  function deleteTransaction(id) {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  }

  // Derived values
  const totalIncome = state.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = state.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = state.budget + totalIncome - totalExpense;
  const budgetUsagePercent = state.budget > 0 ? Math.min(totalExpense / state.budget, 1) : 0;

  return (
    <BudgetContext.Provider
      value={{
        ...state,
        setBudget,
        addTransaction,
        deleteTransaction,
        totalIncome,
        totalExpense,
        remaining,
        budgetUsagePercent,
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
