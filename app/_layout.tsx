import { ChatProvider } from "@/contexts/ChatContext";
import { CopyProvider } from "@/contexts/CopyContext";
import "@/global.css";
import "@/lib/polyfills";
import { NAV_THEME } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { TouchableOpacity, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { width, height } = useWindowDimensions();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <ChatProvider>
          <CopyProvider>
            <KeyboardProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                {/* (drawer) and other screens remain same, just wrapped */}
                <Stack.Screen name="(drawer)" />
                <Stack.Screen
                  name="(modal)/settings"
                  options={{
                    presentation: "modal",
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: "Settings",
                  }}
                />
                <Stack.Screen
                  name="(stack)/profile/[id]"
                  options={({ route }) => ({
                    title: `Profile ${
                      (route.params as { id: string })?.id || ""
                    }`,
                    headerLargeTitle: true,
                    headerShown: false,
                    headerTransparent: true,
                    headerBlurEffect: "regular",
                  })}
                />
                <Stack.Screen
                  name="image-gen"
                  options={{ presentation: "modal", headerShown: false }}
                />
                <Stack.Screen
                  name="(modal)/models"
                  options={{
                    presentation: "containedTransparentModal",
                    headerShown: true,
                    headerTransparent: true,
                    headerBlurEffect: "regular",
                    headerTitle: "Select Model",
                    headerLeft: () => (
                      <TouchableOpacity
                        className="flex items-center justify-center w-8 h-8"
                        onPress={() => router.back()}
                      >
                        <Ionicons name="close" size={24} color="black" />
                      </TouchableOpacity>
                    ),
                  }}
                />
              </Stack>
              <PortalHost />
            </KeyboardProvider>
          </CopyProvider>
        </ChatProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
