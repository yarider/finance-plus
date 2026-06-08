import { COLORS } from "@/constants";
import { useFinanceStore } from "@/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { useEffect } from "react";

export default function TabLayout() {
  const initialize = useFinanceStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <NativeTabs
      disableTransparentOnScrollEdge
      iconColor={{
        default: COLORS.textMuted,
        selected: COLORS.primary,
      }}
      labelStyle={{
        default: {
          color: COLORS.textMuted,
          fontSize: 12,
          fontWeight: "600",
        },
        selected: {
          color: COLORS.primary,
          fontSize: 12,
          fontWeight: "700",
        },
      }}
      minimizeBehavior="never"
      shadowColor="transparent"
      tintColor={COLORS.primary}
    >
      <NativeTabs.Trigger name="index">
        <Icon
          sf={{
            default: "list.bullet.rectangle",
            selected: "list.bullet.rectangle.fill",
          }}
          androidSrc={<VectorIcon family={FontAwesome} name="list-alt" />}
        />
        <Label>Фінанси</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="statistics">
        <Icon
          sf={{
            default: "chart.pie",
            selected: "chart.pie.fill",
          }}
          androidSrc={<VectorIcon family={FontAwesome} name="pie-chart" />}
        />
        <Label>Статистика</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ai">
        <Icon
          sf={{
            default: "sparkles",
            selected: "sparkles",
          }}
          androidSrc={<VectorIcon family={FontAwesome} name="magic" />}
        />
        <Label>AI</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon
          sf={{
            default: "slider.horizontal.3",
            selected: "slider.horizontal.3",
          }}
          androidSrc={<VectorIcon family={FontAwesome} name="sliders" />}
        />
        <Label>Ліміти</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
