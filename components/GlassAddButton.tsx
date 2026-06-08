import { COLORS } from "@/constants";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Platform, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface GlassAddButtonProps {
  onPress: () => void;
}

export function GlassAddButton({ onPress }: GlassAddButtonProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset =
    Platform.OS === "android"
      ? Math.max(insets.bottom + 92, 112)
      : Math.max(insets.bottom + 76, 96);
  const buttonPosition = { bottom: bottomOffset };

  if (isLiquidGlassAvailable()) {
    return (
      <GlassView
        glassEffectStyle="clear"
        isInteractive
        style={[styles.glassContainer, buttonPosition]}
      >
        <Pressable
          accessibilityLabel="Додати операцію"
          accessibilityRole="button"
          onPress={onPress}
          style={styles.pressable}
        >
          <FontAwesome name="plus" size={22} color={COLORS.text} />
        </Pressable>
      </GlassView>
    );
  }

  return (
    <TouchableOpacity
      accessibilityLabel="Додати операцію"
      accessibilityRole="button"
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.fallbackButton, buttonPosition]}
    >
      <FontAwesome name="plus" size={22} color={COLORS.onPrimary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    position: "absolute",
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 22,
    overflow: "hidden",
  },
  pressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackButton: {
    position: "absolute",
    right: 24,
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
