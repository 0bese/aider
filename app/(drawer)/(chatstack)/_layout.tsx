import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { TouchableOpacity } from "react-native";
import Svg, { G, Path } from "react-native-svg";

export default function StackLayout() {
  const nav = useNavigation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBlurEffect: "regular",
        headerShadowVisible: false,
        // headerTransparent: ww

        headerRight: () => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(stack)/profile/2")}
          >
            <Ionicons
              name="person-circle-outline"
              size={24}
              color={colorScheme === "dark" ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        ),
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => nav.dispatch(DrawerActions.openDrawer())}
            activeOpacity={0.7}
          >
            <Svg
              width={24}
              height={24}
              viewBox="0 0 900 900"
              preserveAspectRatio="xMidYMid meet"
            >
              <G
                transform="translate(0, 900) scale(0.1, -0.1)"
                fill={colorScheme === "dark" ? "#fff" : "#000"}
              >
                <Path d="M370 6783 c-127 -44 -180 -77 -251 -158 -86 -96 -119 -189 -119 -335 0 -142 22 -212 96 -311 63 -83 142 -138 259 -180 47 -17 143 -18 1855 -19 1757 0 1807 1 1860 19 122 43 202 102 271 201 106 152 120 349 36 515 -51 101 -143 193 -237 236 -111 52 -5 49 -1936 48 -1594 0 -1794 -2 -1834 -16z" />
                <Path d="M390 4345 c-135 -29 -279 -140 -336 -256 -48 -98 -54 -127 -54 -240 1 -147 21 -209 97 -311 80 -105 186 -170 318 -194 103 -19 8047 -19 8150 0 164 30 297 131 377 286 10 19 18 42 18 52 0 10 9 27 20 38 18 18 20 33 20 135 0 95 -3 115 -15 115 -8 0 -17 12 -20 28 -22 106 -144 249 -261 306 -122 60 167 56 -4224 55 -3118 -1 -4047 -4 -4090 -14z" />
                <Path d="M355 1894 c-113 -43 -202 -106 -261 -186 -72 -97 -94 -168 -94 -307 0 -58 5 -121 11 -140 54 -173 188 -302 368 -355 48 -14 237 -16 1835 -16 1968 0 1803 -5 1945 63 236 114 339 424 222 667 -64 133 -162 218 -311 271 -53 18 -103 19 -1865 18 -1591 0 -1815 -2 -1850 -15z" />
              </G>
            </Svg>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="(chat)/index"
        options={{
          title: "New Chat",
        }}
      />
      <Stack.Screen
        name="(chat)/[id]"
        options={{
          title: "Chat",
        }}
      />
    </Stack>
  );
}
