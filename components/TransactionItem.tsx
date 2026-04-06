import { COLORS } from "@/constants";
import { Category, Transaction } from "@/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onDelete?: (id: string) => void;
}

export function TransactionItem({
  transaction,
  category,
  onDelete,
}: TransactionItemProps) {
  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "long",
  });

  const handleDelete = () => {
    Alert.alert("Видалити операцію", "Цю дію не можна скасувати.", [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Видалити",
        onPress: () => onDelete?.(transaction.id),
        style: "destructive",
      },
    ]);
  };

  const isExpense = transaction.type === "expense";
  const amountColor = isExpense ? COLORS.danger : COLORS.secondary;
  const amountSign = isExpense ? "-" : "+";
  const description = transaction.description?.trim() || "Без опису";

  return (
    <View style={styles.container}>
      <View style={styles.leading}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: `${category?.color || COLORS.primary}18` },
          ]}
        >
          <Text style={[styles.icon, { color: category?.color || COLORS.primary }]}>
            {category?.icon || "📌"}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.category}>
            {category?.name || "Невідома категорія"}
          </Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>

      <View style={styles.trailing}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountSign}
          {transaction.amount.toFixed(2)} ₴
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <FontAwesome name="trash-o" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
  },
  leading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  category: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  date: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  trailing: {
    alignItems: "flex-end",
    gap: 8,
    marginLeft: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: "800",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceContainer,
  },
});
