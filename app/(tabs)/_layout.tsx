import { COLORS } from "@/constants";
import { useFinanceStore } from "@/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useEffect } from "react";

export default function TabLayout() {
  const initialize = useFinanceStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: COLORS.background,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarStyle: {
          height: 72,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: COLORS.surfaceContainer,
          borderTopWidth: 0,
          elevation: 0,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerShadowVisible: false,
        headerTintColor: COLORS.onPrimaryContainer,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Облік",
          tabBarLabel: "Облік",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="list-alt" size={size} color={color} />
          ),
          headerTitle: "Фінансовий журнал",
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Статистика",
          tabBarLabel: "Статистика",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="pie-chart" size={size} color={color} />
          ),
          headerTitle: "Аналітика витрат",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ліміти",
          tabBarLabel: "Ліміти",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="sliders" size={size} color={color} />
          ),
          headerTitle: "Категорії та ліміти",
        }}
      />
    </Tabs>
  );
}
