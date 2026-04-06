import { COLORS } from "@/constants";
import { Category, Transaction, TransactionType } from "@/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, "id">) => void;
  categories: Category[];
}

export function AddTransactionModal({
  visible,
  onClose,
  onAdd,
  categories,
}: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categoryList = categories.filter((c) => c.type === type);

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  const handleAdd = () => {
    if (!amount || !selectedCategory) {
      Alert.alert("Помилка", "Заповніть суму та оберіть категорію.");
      return;
    }

    onAdd({
      amount: parseFloat(amount),
      categoryId: selectedCategory,
      description,
      date: date.toISOString(),
      type,
    });

    setAmount("");
    setDescription("");
    setSelectedCategory(null);
    setDate(new Date());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Нова транзакція</Text>
              <Text style={styles.title}>Додати операцію</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <FontAwesome name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.segmented}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  type === "expense" && styles.segmentButtonActive,
                ]}
                onPress={() => {
                  setType("expense");
                  setSelectedCategory(null);
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    type === "expense" && styles.segmentTextActive,
                  ]}
                >
                  Витрата
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  type === "income" && styles.segmentButtonActive,
                ]}
                onPress={() => {
                  setType("income");
                  setSelectedCategory(null);
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    type === "income" && styles.segmentTextActive,
                  ]}
                >
                  Дохід
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Сума</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Категорія</Text>
              <View style={styles.categoryGrid}>
                {categoryList.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      selectedCategory === cat.id && styles.categoryItemSelected,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Опис</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Необов'язково"
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Дата</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <FontAwesome name="calendar-o" size={18} color={COLORS.primary} />
                <Text style={styles.dateButtonText}>
                  {date.toLocaleDateString("uk-UA")}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
              <Text style={styles.saveText}>Додати</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(28, 27, 31, 0.38)",
  },
  container: {
    maxHeight: "92%",
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceContainer,
  },
  content: {
    maxHeight: "72%",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
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
  field: {
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
  descriptionInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryItem: {
    width: "23%",
    aspectRatio: 0.92,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: COLORS.surfaceContainer,
  },
  categoryItemSelected: {
    backgroundColor: COLORS.primaryContainer,
  },
  categoryIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: "center",
    color: COLORS.text,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surfaceContainer,
  },
  dateButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  footer: {
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
