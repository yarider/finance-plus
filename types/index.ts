export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
}

export interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  type: TransactionType;
}

export interface BudgetLimit {
  id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Record<string, number>;
}
