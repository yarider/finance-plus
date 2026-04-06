import { COLORS, MONTH_NAMES } from "@/constants";
import { useFinanceStore } from "@/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StatisticsScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewType, setViewType] = useState<"expense" | "income">("expense");

  const { categories, getTransactionsByMonth } = useFinanceStore();

  const monthTransactions = getTransactionsByMonth(selectedMonth, selectedYear);
  const filteredTransactions = monthTransactions.filter(
    (t) => t.type === viewType,
  );

  const categoryStats: Record<string, number> = {};
  filteredTransactions.forEach((t) => {
    categoryStats[t.categoryId] = (categoryStats[t.categoryId] || 0) + t.amount;
  });

  const categoryData = Object.entries(categoryStats)
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      category: categories.find((c) => c.id === categoryId),
    }))
    .filter((item) => item.category)
    .sort((a, b) => b.amount - a.amount);

  const total = categoryData.reduce((sum, item) => sum + item.amount, 0);
  const topShare = total > 0 ? (categoryData[0]?.amount ?? 0) / total : 0;

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.periodCard}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.iconButton}>
            <FontAwesome name="chevron-left" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.periodContent}>
            <Text style={styles.periodLabel}>Період аналізу</Text>
            <Text style={styles.periodText}>
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </Text>
          </View>
          <TouchableOpacity onPress={goToNextMonth} style={styles.iconButton}>
            <FontAwesome name="chevron-right" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.segmented}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              viewType === "expense" && styles.segmentButtonActive,
            ]}
            onPress={() => setViewType("expense")}
          >
            <Text
              style={[
                styles.segmentText,
                viewType === "expense" && styles.segmentTextActive,
              ]}
            >
              Витрати
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              viewType === "income" && styles.segmentButtonActive,
            ]}
            onPress={() => setViewType("income")}
          >
            <Text
              style={[
                styles.segmentText,
                viewType === "income" && styles.segmentTextActive,
              ]}
            >
              Доходи
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>
            {viewType === "expense" ? "Загальні витрати" : "Загальні доходи"}
          </Text>
          <Text style={styles.totalValue}>{total.toFixed(2)} ₴</Text>
        </View>

        {categoryData.length > 0 ? (
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Огляд структури</Text>
            <View style={styles.highlightRow}>
              <View style={styles.highlightStat}>
                <Text style={styles.highlightValue}>
                  {Math.round(topShare * 100)}%
                </Text>
                <Text style={styles.highlightLabel}>найбільша частка</Text>
              </View>
              <View style={styles.highlightStat}>
                <Text style={styles.highlightValue}>{categoryData.length}</Text>
                <Text style={styles.highlightLabel}>категорій у періоді</Text>
              </View>
            </View>
            <View style={styles.stackBar}>
              {categoryData.map((item) => (
                <View
                  key={item.categoryId}
                  style={[
                    styles.stackSegment,
                    {
                      flex: item.amount,
                      backgroundColor: item.category!.color,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <FontAwesome name="bar-chart" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Недостатньо даних</Text>
            <Text style={styles.emptyText}>
              Додайте кілька операцій у вибраному періоді.
            </Text>
          </View>
        )}

        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Розподіл по категоріях</Text>
          {categoryData.length === 0 ? (
            <Text style={styles.placeholderText}>
              Тут з&apos;явиться деталізація.
            </Text>
          ) : (
            categoryData.map((item) => (
              <View key={item.categoryId} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: `${item.category!.color}18` },
                    ]}
                  >
                    <Text style={styles.categoryIcon}>{item.category!.icon}</Text>
                  </View>
                  <View style={styles.categoryMeta}>
                    <Text style={styles.categoryName}>{item.category!.name}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${(item.amount / total) * 100}%`,
                            backgroundColor: item.category!.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.amountBlock}>
                  <Text style={styles.amount}>{item.amount.toFixed(2)} ₴</Text>
                  <Text style={styles.percent}>
                    {((item.amount / total) * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  periodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceContainer,
  },
  periodContent: {
    alignItems: "center",
    gap: 4,
  },
  periodLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  periodText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 18,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: COLORS.surface,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.primary,
  },
  totalCard: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 28,
    padding: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.onPrimaryContainer,
    opacity: 0.72,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.onPrimaryContainer,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },
  highlightRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  highlightStat: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    backgroundColor: COLORS.surfaceContainer,
  },
  highlightValue: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  highlightLabel: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  stackBar: {
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 999,
    height: 18,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  stackSegment: {
    height: "100%",
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryContainer,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: COLORS.textMuted,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryMeta: {
    flex: 1,
    gap: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainerHigh,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
  },
  amountBlock: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  percent: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
