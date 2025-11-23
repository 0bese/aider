import "@/global.css";
import "@/lib/polyfills";
import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { width, height } = useWindowDimensions();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(drawer)" />
          <Stack.Screen
            name="(modal)/settings"
            options={{ presentation: "modal", headerShown: true }}
          />
          <Stack.Screen
            name="(stack)/profile/[id]"
            options={({ route }) => ({
              title: `Profile ${(route.params as { id: string })?.id || ""}`,
              headerLargeTitle: true,
              headerShown: false,
              headerTransparent: true,
              headerBlurEffect: "regular",
            })}
          />
        </Stack>
        <PortalHost />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
