import { COLORS, MONTH_NAMES } from "@/constants";
import { useFinanceStore } from "@/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  SectionList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { categories, budgetLimits, addBudgetLimit } = useFinanceStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [limitAmount, setLimitAmount] = useState("");
  const [selectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());
  const [limitModalMounted, setLimitModalMounted] = useState(false);
  const limitModalSlideAnim = useRef(new Animated.Value(windowHeight)).current;

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  useEffect(() => {
    if (!modalVisible) {
      setLimitModalMounted(false);
      return;
    }

    setLimitModalMounted(true);
    limitModalSlideAnim.setValue(windowHeight);
    Animated.timing(limitModalSlideAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [limitModalSlideAnim, modalVisible, windowHeight]);

  const closeLimitModal = (afterClose?: () => void) => {
    Animated.timing(limitModalSlideAnim, {
      toValue: windowHeight,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      afterClose?.();
      setLimitModalMounted(false);
      setModalVisible(false);
    });
  };

  const handleSetLimit = () => {
    if (!selectedCategory || !limitAmount) {
      Alert.alert("Помилка", "Заповніть усі поля.");
      return;
    }

    addBudgetLimit({
      id: `${selectedCategory}-${selectedMonth}-${selectedYear}`,
      categoryId: selectedCategory,
      amount: parseFloat(limitAmount),
      month: selectedMonth,
      year: selectedYear,
    });

    closeLimitModal(() => {
      setLimitAmount("");
      setSelectedCategory(null);
      Alert.alert("Готово", "Ліміт збережено.");
    });
  };

  const getCategoryLimit = (categoryId: string) =>
    budgetLimits.find(
      (l) =>
        l.categoryId === categoryId &&
        l.month === selectedMonth &&
        l.year === selectedYear,
    );

  const sections = [
    {
      title: "Витрати",
      data: expenseCategories,
      editable: true,
    },
    {
      title: "Доходи",
      data: incomeCategories,
      editable: false,
    },
  ];

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <SafeAreaView
      collapsable={false}
      style={styles.container}
      edges={["top", "bottom", "left", "right"]}
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Активний період</Text>
        <Text style={styles.heroTitle}>
          {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
        </Text>
        <Text style={styles.heroText}>
          Керуйте лімітами для витратних категорій у межах одного місяця.
        </Text>
      </View>

      <SectionList
        contentInsetAdjustmentBehavior="automatic"
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        renderItem={({ item, section }) => {
          const limit = getCategoryLimit(item.id);

          return (
            <View style={styles.categoryItem}>
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: `${item.color}18` },
                  ]}
                >
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                </View>
                <View style={styles.categoryMeta}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryHint}>
                    {limit ? `Ліміт: ${limit.amount.toFixed(2)} ₴` : "Ліміт не задано"}
                  </Text>
                </View>
              </View>

              {section.editable ? (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedCategory(item.id);
                    setLimitAmount(limit?.amount.toString() || "");
                    setModalVisible(true);
                  }}
                >
                  <FontAwesome name="pencil" size={15} color={COLORS.primary} />
                </TouchableOpacity>
              ) : (
                <View style={styles.readOnlyBadge}>
                  <Text style={styles.readOnlyText}>Інфо</Text>
                </View>
              )}
            </View>
          );
        }}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={limitModalMounted}
        animationType="none"
        transparent
        onRequestClose={() => closeLimitModal()}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={insets.top}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              { maxHeight: windowHeight - insets.top - 12 },
              { transform: [{ translateY: limitModalSlideAnim }] },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalLabel}>Місячний бюджет</Text>
                <Text style={styles.modalTitle}>Встановити ліміт</Text>
              </View>
              <TouchableOpacity
                onPress={() => closeLimitModal()}
                style={styles.closeButton}
              >
                <FontAwesome name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
            >
              {selectedCategoryData && (
                <View style={styles.selectedCard}>
                  <View
                    style={[
                      styles.selectedIconWrap,
                      { backgroundColor: `${selectedCategoryData.color}18` },
                    ]}
                  >
                    <Text style={styles.selectedCategoryIcon}>
                      {selectedCategoryData.icon}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.selectedCategoryName}>
                      {selectedCategoryData.name}
                    </Text>
                    <Text style={styles.selectedCategoryHint}>
                      {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Сума ліміту</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                  value={limitAmount}
                  onChangeText={setLimitAmount}
                />
              </View>
            </ScrollView>

            <View
              style={[
                styles.modalFooter,
                { paddingBottom: Math.max(insets.bottom + 12, 16) },
              ]}
            >
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => closeLimitModal()}
              >
                <Text style={styles.cancelText}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSetLimit}>
                <Text style={styles.saveText}>Зберегти</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 28,
    padding: 20,
  },
  heroLabel: {
    fontSize: 12,
    color: COLORS.onPrimaryContainer,
    opacity: 0.72,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
  },
  categoryLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryMeta: {
    flex: 1,
    gap: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  categoryHint: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryContainer,
  },
  readOnlyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainer,
  },
  readOnlyText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(28, 27, 31, 0.38)",
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceContainer,
  },
  modalContent: {
    maxHeight: "72%",
  },
  modalContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  selectedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 24,
    padding: 16,
    backgroundColor: COLORS.surfaceContainer,
    marginBottom: 20,
  },
  selectedIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCategoryIcon: {
    fontSize: 24,
  },
  selectedCategoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  selectedCategoryHint: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  formGroup: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surfaceContainer,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainer,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  saveButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  saveText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.onPrimary,
  },
});
