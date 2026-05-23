import * as SQLite from "expo-sqlite";
import { BudgetLimit, Category, Transaction } from "../types";

const db = SQLite.openDatabaseSync("finance-plus.db");

export async function initDatabase() {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        categoryId TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        type TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        type TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS budget_limits (
        id TEXT PRIMARY KEY,
        categoryId TEXT NOT NULL,
        amount REAL NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL
      );
    `);
    console.log("БД ініціалізовано успішно");
  } catch (error) {
    console.error("БД ініціалізація помилка:", error);
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const result = await db.getAllAsync<Transaction>(
      "SELECT * FROM transactions ORDER BY date DESC",
    );
    return result || [];
  } catch (error) {
    console.error("Помилка отримання транзакцій:", error);
    return [];
  }
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  try {
    await db.runAsync(
      "INSERT INTO transactions (id, amount, categoryId, description, date, type) VALUES (?, ?, ?, ?, ?, ?)",
      [
        transaction.id,
        transaction.amount,
        transaction.categoryId,
        transaction.description,
        transaction.date,
        transaction.type,
      ],
    );
  } catch (error) {
    console.error("Помилка додавання транзакції:", error);
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  try {
    await db.runAsync("DELETE FROM transactions WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error deleting transaction:", error);
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const result = await db.getAllAsync<Category>("SELECT * FROM categories");
    return result || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function addCategory(category: Category): Promise<void> {
  try {
    await db.runAsync(
      "INSERT OR REPLACE INTO categories (id, name, icon, color, type) VALUES (?, ?, ?, ?, ?)",
      [
        category.id,
        category.name,
        category.icon,
        category.color,
        category.type,
      ],
    );
  } catch (error) {
    console.error("Error adding category:", error);
  }
}

export async function getAllBudgetLimits(): Promise<BudgetLimit[]> {
  try {
    const result = await db.getAllAsync<BudgetLimit>(
      "SELECT * FROM budget_limits",
    );
    return result || [];
  } catch (error) {
    console.error("Error fetching budget limits:", error);
    return [];
  }
}

export async function addBudgetLimit(limit: BudgetLimit): Promise<void> {
  try {
    await db.runAsync(
      "INSERT OR REPLACE INTO budget_limits (id, categoryId, amount, month, year) VALUES (?, ?, ?, ?, ?)",
      [limit.id, limit.categoryId, limit.amount, limit.month, limit.year],
    );
  } catch (error) {
    console.error("Error adding budget limit:", error);
  }
}

export async function deleteBudgetLimit(id: string): Promise<void> {
  try {
    await db.runAsync("DELETE FROM budget_limits WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error deleting budget limit:", error);
  }
}
