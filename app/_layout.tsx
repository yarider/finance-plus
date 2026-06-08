import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { COLORS } from "@/constants";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

const LIGHT_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.background,
    text: COLORS.text,
    border: "transparent",
    notification: COLORS.primary,
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={LIGHT_THEME}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
