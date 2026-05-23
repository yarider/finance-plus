import { create } from "zustand";
import { CATEGORIES_EXPENSE, CATEGORIES_INCOME } from "../constants";
import { BudgetLimit, Category, Transaction } from "../types";
import {
    addBudgetLimit as dbAddBudgetLimit,
    addTransaction as dbAddTransaction,
    deleteTransaction as dbDeleteTransaction,
    deleteBudgetLimit as dbDeleteBudgetLimit,
    getAllBudgetLimits,
    getAllCategories,
    getAllTransactions,
    initDatabase,
} from "./database";

interface Store {
  transactions: Transaction[];
  categories: Category[];
  budgetLimits: BudgetLimit[];
  initialized: boolean;

  // Тут описую запуск стору: ця функція підтягує дані з бази і готує їх для додатку.
  initialize: () => Promise<void>;

  // Тут зібрані дії для транзакцій: можна додати запис, видалити його або взяти записи за конкретний місяць.
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionsByMonth: (month: number, year: number) => Transaction[];

  // Тут функції для категорій, щоб додавати нові категорії або прибирати ті, які вже не потрібні.
  addCategory: (category: Category) => void;
  removeCategory: (id: string) => void;

  // Тут працюю з бюджетними лімітами: додаю ліміт, шукаю його по категорії і місяцю, або видаляю.
  addBudgetLimit: (limit: BudgetLimit) => Promise<void>;
  getBudgetLimit: (
    categoryId: string,
    month: number,
    year: number,
  ) => BudgetLimit | undefined;
  removeBudgetLimit: (id: string) => Promise<void>;
}

export const useFinanceStore = create<Store>((set, get) => ({
  transactions: [],
  categories: [],
  budgetLimits: [],
  initialized: false,

  initialize: async () => {
    try {
      await initDatabase();
      const transactions = await getAllTransactions();
      const categories = await getAllCategories();
      const budgetLimits = await getAllBudgetLimits();
      const defaultCategories = [
        ...CATEGORIES_EXPENSE.map((c) => ({
          ...c,
          type: "expense" as const,
        })),
        ...CATEGORIES_INCOME.map((c) => ({
          ...c,
          type: "income" as const,
        })),
      ];
      const defaultCategoryIds = new Set(
        defaultCategories.map((category) => category.id),
      );
      const customCategories = (categories || []).filter(
        (category) => !defaultCategoryIds.has(category.id),
      );

      set({
        transactions: transactions || [],
        categories: [...defaultCategories, ...customCategories],
        budgetLimits: budgetLimits || [],
        initialized: true,
      });
    } catch (error) {
      console.error("Failed to initialize store:", error);
      set({ initialized: true });
    }
  },

  addTransaction: async (transaction) => {
    try {
      const id = Date.now().toString();
      const newTransaction: Transaction = { ...transaction, id };
      await dbAddTransaction(newTransaction);
      set((state) => ({
        transactions: [...state.transactions, newTransaction],
      }));
    } catch (error) {
      console.error("Помилка додавання транзакції:", error);
    }
  },

  deleteTransaction: async (id) => {
    try {
      await dbDeleteTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error("Помилка видалення транзакції:", error);
    }
  },

  getTransactionsByMonth: (month, year) => {
    const { transactions } = get();
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === month - 1 && date.getFullYear() === year;
    });
  },

  addCategory: (category) => {
    set((state) => ({
      categories: [...state.categories, category],
    }));
  },

  removeCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },

  addBudgetLimit: async (limit) => {
    try {
      await dbAddBudgetLimit(limit);
      set((state) => ({
        budgetLimits: [
          ...state.budgetLimits.filter((item) => item.id !== limit.id),
          limit,
        ],
      }));
    } catch (error) {
      console.error("Failed to add budget limit:", error);
    }
  },

  getBudgetLimit: (categoryId, month, year) => {
    const { budgetLimits } = get();
    return budgetLimits.find(
      (l) =>
        l.categoryId === categoryId && l.month === month && l.year === year,
    );
  },

  removeBudgetLimit: async (id) => {
    try {
      await dbDeleteBudgetLimit(id);
      set((state) => ({
        budgetLimits: state.budgetLimits.filter((l) => l.id !== id),
      }));
    } catch (error) {
      console.error("Failed to remove budget limit:", error);
    }
  },
}));
