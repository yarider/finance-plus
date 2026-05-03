import {
  answerFinanceQuestion,
  buildFinanceSnapshot,
  generateFinanceInsights,
  AiInsight,
} from "@/services/financeAi";
import { COLORS, MONTH_NAMES } from "@/constants";
import { useFinanceStore } from "@/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const quickPrompts = [
  "Як зекономити цього місяця?",
  "Де ризик перевищити ліміт?",
  "Який баланс за місяць?",
  "Дай коротку пораду",
];

const toneStyles: Record<AiInsight["tone"], { icon: string; color: string }> = {
  good: { icon: "check-circle", color: COLORS.secondary },
  warning: { icon: "exclamation-circle", color: COLORS.warning },
  danger: { icon: "times-circle", color: COLORS.danger },
  neutral: { icon: "lightbulb-o", color: COLORS.primary },
};

export default function AiScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { categories, budgetLimits, getTransactionsByMonth } = useFinanceStore();
  const monthTransactions = getTransactionsByMonth(selectedMonth, selectedYear);

  const snapshot = useMemo(
    () =>
      buildFinanceSnapshot({
        transactions: monthTransactions,
        categories,
        budgetLimits,
        month: selectedMonth,
        year: selectedYear,
      }),
    [budgetLimits, categories, monthTransactions, selectedMonth, selectedYear],
  );

  const insights = useMemo(() => generateFinanceInsights(snapshot), [snapshot]);

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

  const askAi = (text: string) => {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: "user", text: trimmed },
      {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: answerFinanceQuestion(trimmed, snapshot),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.periodCard}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.iconButton}>
            <FontAwesome name="chevron-left" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.periodContent}>
            <Text style={styles.periodLabel}>AI аналізує період</Text>
            <Text style={styles.periodText}>
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </Text>
          </View>
          <TouchableOpacity onPress={goToNextMonth} style={styles.iconButton}>
            <FontAwesome name="chevron-right" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryBand}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Баланс</Text>
            <Text style={styles.summaryValue}>{snapshot.balance.toFixed(2)} грн</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Заощадження</Text>
            <Text style={styles.summaryValue}>
              {Math.round(snapshot.savingRate * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <FontAwesome name="magic" size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>AI інсайти</Text>
        </View>

        {insights.map((item) => {
          const tone = toneStyles[item.tone];

          return (
            <View key={item.id} style={styles.insightCard}>
              <View
                style={[
                  styles.insightIcon,
                  { backgroundColor: `${tone.color}18` },
                ]}
              >
                <FontAwesome name={tone.icon as never} size={18} color={tone.color} />
              </View>
              <View style={styles.insightTextBlock}>
                <Text style={styles.insightTitle}>{item.title}</Text>
                <Text style={styles.insightBody}>{item.body}</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.sectionHeader}>
          <FontAwesome name="comments-o" size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Запитати AI</Text>
        </View>

        <View style={styles.promptGrid}>
          {quickPrompts.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.promptButton}
              onPress={() => askAi(item)}
            >
              <Text style={styles.promptText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chatBox}>
          {messages.length === 0 ? (
            <Text style={styles.emptyChat}>
              Оберіть одне з готових питань, щоб отримати відповідь по бюджету за вибраний місяць.
            </Text>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.role === "user"
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === "user" && styles.userMessageText,
                  ]}
                >
                  {message.text}
                </Text>
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
    gap: 14,
    paddingBottom: 32,
  },
  periodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: 24,
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
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
  },
  periodLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  periodText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  summaryBand: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    padding: 18,
    backgroundColor: COLORS.primaryContainer,
  },
  summaryItem: {
    flex: 1,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.onPrimaryContainer,
    opacity: 0.72,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.onPrimaryContainer,
  },
  summaryDivider: {
    width: 1,
    height: 44,
    marginHorizontal: 16,
    backgroundColor: "rgba(33, 0, 93, 0.18)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  insightCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 22,
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  insightTextBlock: {
    flex: 1,
    gap: 5,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  insightBody: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
  },
  promptGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  promptButton: {
    maxWidth: "100%",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceContainer,
  },
  promptText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  chatBox: {
    minHeight: 140,
    gap: 10,
    borderRadius: 24,
    padding: 14,
    backgroundColor: COLORS.surface,
  },
  emptyChat: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
  },
  messageBubble: {
    maxWidth: "88%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.surfaceContainer,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  userMessageText: {
    color: COLORS.onPrimary,
  },
});
