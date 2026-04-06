import { AddTransactionModal } from "@/components/AddTransactionModal";
import { TransactionItem } from "@/components/TransactionItem";
import { COLORS, MONTH_NAMES } from "@/constants";
import { useFinanceStore } from "@/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  const {
    categories,
    addTransaction,
    deleteTransaction,
    getTransactionsByMonth,
  } = useFinanceStore();

  const monthTransactions = getTransactionsByMonth(selectedMonth, selectedYear);

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  useFocusEffect(
    React.useCallback(() => {
      setRefreshing(false);
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

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

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <FlatList
        data={[...monthTransactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            category={getCategoryById(item.categoryId)}
            onDelete={deleteTransaction}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <View style={styles.monthNav}>
                <TouchableOpacity
                  onPress={goToPreviousMonth}
                  style={styles.navButton}
                >
                  <FontAwesome
                    name="chevron-left"
                    size={16}
                    color={COLORS.onPrimaryContainer}
                  />
                </TouchableOpacity>
                <View style={styles.monthMeta}>
                  <Text style={styles.monthLabel}>Період</Text>
                  <Text style={styles.monthText}>
                    {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                  </Text>
                </View>
                <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                  <FontAwesome
                    name="chevron-right"
                    size={16}
                    color={COLORS.onPrimaryContainer}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>Поточний баланс</Text>
                <Text style={styles.balanceValue}>{balance.toFixed(2)} ₴</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.incomeCard]}>
                <Text style={styles.statLabel}>Доходи</Text>
                <Text style={[styles.statValue, styles.incomeValue]}>
                  +{totalIncome.toFixed(2)} ₴
                </Text>
              </View>
              <View style={[styles.statCard, styles.expenseCard]}>
                <Text style={styles.statLabel}>Витрати</Text>
                <Text style={[styles.statValue, styles.expenseValue]}>
                  -{totalExpense.toFixed(2)} ₴
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Операції за місяць</Text>
              <Text style={styles.sectionCount}>{monthTransactions.length}</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <FontAwesome name="inbox" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Операцій ще немає</Text>
            <Text style={styles.emptyText}>
              Додайте першу транзакцію, щоб побачити рух коштів.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        <FontAwesome name="plus" size={22} color={COLORS.onPrimary} />
      </TouchableOpacity>

      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addTransaction}
        categories={categories}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 12,
  },
  heroCard: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 28,
    padding: 20,
    gap: 20,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  monthMeta: {
    alignItems: "center",
    gap: 4,
  },
  monthLabel: {
    fontSize: 12,
    color: COLORS.onPrimaryContainer,
    opacity: 0.72,
  },
  monthText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.onPrimaryContainer,
  },
  balanceSection: {
    gap: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.onPrimaryContainer,
    opacity: 0.72,
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.onPrimaryContainer,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    gap: 6,
  },
  incomeCard: {
    backgroundColor: COLORS.successContainer,
  },
  expenseCard: {
    backgroundColor: COLORS.errorContainer,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  incomeValue: {
    color: COLORS.secondary,
  },
  expenseValue: {
    color: COLORS.danger,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  sectionCount: {
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    textAlign: "center",
    color: COLORS.primary,
    backgroundColor: COLORS.surfaceContainerHigh,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryContainer,
    marginBottom: 16,
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
  addButton: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
});
