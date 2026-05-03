import { Category, BudgetLimit, Transaction } from "@/types";

export interface AiInsight {
  id: string;
  title: string;
  body: string;
  tone: "good" | "warning" | "danger" | "neutral";
}

interface CategoryTotal {
  categoryId: string;
  name: string;
  amount: number;
  share: number;
  limit?: number;
}

export interface FinanceSnapshot {
  income: number;
  expense: number;
  balance: number;
  savingRate: number;
  transactionCount: number;
  averageExpense: number;
  topExpense?: CategoryTotal;
  categoryTotals: CategoryTotal[];
  limitWarnings: CategoryTotal[];
}

interface SnapshotInput {
  transactions: Transaction[];
  categories: Category[];
  budgetLimits: BudgetLimit[];
  month: number;
  year: number;
}

const currency = (value: number) => `${value.toFixed(2)} грн`;

export function buildFinanceSnapshot({
  transactions,
  categories,
  budgetLimits,
  month,
  year,
}: SnapshotInput): FinanceSnapshot {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions.filter((item) => item.type === "expense");
  const expense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expense;

  const totalsByCategory = expenses.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.categoryId] = (acc[item.categoryId] ?? 0) + item.amount;
      return acc;
    },
    {},
  );

  const categoryTotals = Object.entries(totalsByCategory)
    .map(([categoryId, amount]) => {
      const category = categories.find((item) => item.id === categoryId);
      const limit = budgetLimits.find(
        (item) =>
          item.categoryId === categoryId &&
          item.month === month &&
          item.year === year,
      )?.amount;

      return {
        categoryId,
        name: category?.name ?? "Категорія",
        amount,
        share: expense > 0 ? amount / expense : 0,
        limit,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return {
    income,
    expense,
    balance,
    savingRate: income > 0 ? balance / income : 0,
    transactionCount: transactions.length,
    averageExpense: expenses.length > 0 ? expense / expenses.length : 0,
    topExpense: categoryTotals[0],
    categoryTotals,
    limitWarnings: categoryTotals.filter(
      (item) => item.limit !== undefined && item.amount >= item.limit * 0.8,
    ),
  };
}

export function generateFinanceInsights(snapshot: FinanceSnapshot): AiInsight[] {
  const insights: AiInsight[] = [];

  if (snapshot.transactionCount === 0) {
    return [
      {
        id: "empty",
        title: "Недостатньо даних",
        body: "Додайте кілька доходів і витрат, щоб AI зміг знайти закономірності у бюджеті.",
        tone: "neutral",
      },
    ];
  }

  if (snapshot.income === 0) {
    insights.push({
      id: "no-income",
      title: "Не зафіксовано доходів",
      body: "Без доходів складно оцінити норму заощаджень. Додайте регулярні надходження за цей місяць.",
      tone: "warning",
    });
  } else if (snapshot.savingRate >= 0.2) {
    insights.push({
      id: "saving-rate-good",
      title: "Сильна норма заощаджень",
      body: `Ви залишаєте ${Math.round(snapshot.savingRate * 100)}% доходу. Це хороший запас для цілей, резерву або інвестицій.`,
      tone: "good",
    });
  } else if (snapshot.savingRate >= 0) {
    insights.push({
      id: "saving-rate-low",
      title: "Є простір для економії",
      body: `Після витрат залишається ${currency(snapshot.balance)}. Спробуйте зменшити 1-2 найбільші категорії на 10%.`,
      tone: "warning",
    });
  } else {
    insights.push({
      id: "negative-balance",
      title: "Витрати перевищили доходи",
      body: `Баланс місяця становить ${currency(snapshot.balance)}. Варто тимчасово зупинити необов'язкові покупки.`,
      tone: "danger",
    });
  }

  if (snapshot.topExpense) {
    insights.push({
      id: "top-expense",
      title: `Найбільша категорія: ${snapshot.topExpense.name}`,
      body: `${currency(snapshot.topExpense.amount)} - це ${Math.round(snapshot.topExpense.share * 100)}% усіх витрат місяця.`,
      tone: snapshot.topExpense.share > 0.4 ? "warning" : "neutral",
    });
  }

  snapshot.limitWarnings.slice(0, 2).forEach((item) => {
    const used = item.limit ? Math.round((item.amount / item.limit) * 100) : 0;
    insights.push({
      id: `limit-${item.categoryId}`,
      title: `Ліміт майже вичерпано: ${item.name}`,
      body: `Використано ${used}% ліміту (${currency(item.amount)} з ${currency(item.limit ?? 0)}).`,
      tone: used >= 100 ? "danger" : "warning",
    });
  });

  if (snapshot.averageExpense > 0) {
    insights.push({
      id: "average-expense",
      title: "Середній чек витрат",
      body: `Одна витратна операція в середньому дорівнює ${currency(snapshot.averageExpense)}. Це допомагає оцінити щоденний темп витрат.`,
      tone: "neutral",
    });
  }

  return insights.slice(0, 5);
}

export function answerFinanceQuestion(
  question: string,
  snapshot: FinanceSnapshot,
): string {
  const normalized = question.toLowerCase();

  if (snapshot.transactionCount === 0) {
    return "Поки що немає операцій за вибраний місяць. Додайте доходи й витрати, і я зможу порахувати баланс, ризики лімітів та основні категорії.";
  }

  if (normalized.includes("економ") || normalized.includes("зеконом")) {
    if (!snapshot.topExpense) {
      return "Найшвидший крок - зафіксувати витрати по категоріях. Після цього буде видно, де скорочення дасть найбільший ефект.";
    }

    const target = snapshot.topExpense.amount * 0.1;
    return `Почніть з категорії "${snapshot.topExpense.name}". Якщо зменшити її на 10%, ви збережете приблизно ${currency(target)} за місяць.`;
  }

  if (normalized.includes("ліміт") || normalized.includes("ризик")) {
    if (snapshot.limitWarnings.length === 0) {
      return "Критичних ризиків по лімітах не видно. Найкраще контролювати найбільшу категорію витрат і перевіряти її раз на кілька днів.";
    }

    const warning = snapshot.limitWarnings[0];
    return `Найбільший ризик зараз у категорії "${warning.name}": витрачено ${currency(warning.amount)}${warning.limit ? ` з ${currency(warning.limit)}` : ""}.`;
  }

  if (normalized.includes("баланс") || normalized.includes("скільки")) {
    return `За місяць: доходи ${currency(snapshot.income)}, витрати ${currency(snapshot.expense)}, баланс ${currency(snapshot.balance)}.`;
  }

  if (normalized.includes("порада") || normalized.includes("що робити")) {
    if (snapshot.balance < 0) {
      return "Найважливіше зараз - повернути місяць у плюс. Зупиніть необов'язкові витрати й перегляньте найбільшу категорію.";
    }

    if (snapshot.savingRate >= 0.2) {
      return "Бюджет виглядає стабільно. Наступний крок - спрямувати частину залишку на резерв або фінансову ціль.";
    }

    return "Почніть з малого: встановіть ліміт для найбільшої категорії та спробуйте втримати витрати на 10% нижче поточного рівня.";
  }

  return "Я бачу ваші доходи, витрати, баланс, ліміти та найбільші категорії. Запитайте, як зекономити, де ризик ліміту або який баланс за місяць.";
}
