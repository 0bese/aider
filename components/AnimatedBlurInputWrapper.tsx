import { useKeyboardAnimation } from "@/hooks/useKeyboardAnimation";
import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { memo, ReactNode } from "react";
import { Platform, StyleSheet } from "react-native";
import { easeGradient } from "react-native-easing-gradient";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnimatedBlurInputWrapperProps {
  children: ReactNode;
  style?: any;
}

export const AnimatedBlurInputWrapper = memo<AnimatedBlurInputWrapperProps>(
  ({ children, style }) => {
    const { bottom } = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const { height: keyboardHeight } = useKeyboardAnimation();

    const inputContainerStyle = useAnimatedStyle(
      () => ({
        transform: [{ translateY: -Math.max(keyboardHeight.value, bottom) }],
        paddingBottom: bottom,
      }),
      [bottom]
    );

    const { colors, locations } = easeGradient({
      colorStops: {
        0: { color: "transparent" },
        0.3: {
          color:
            colorScheme === "dark"
              ? "rgba(0,0,0,0.99)"
              : "rgba(255,255,255,0.99)",
        },
        1: {
          color: colorScheme === "dark" ? "black" : "white",
        },
      },
    });

    return (
      <Reanimated.View style={[styles.container, inputContainerStyle, style]}>
        <MaskedView
          maskElement={
            <LinearGradient
              locations={locations as any}
              colors={colors as any}
              style={StyleSheet.absoluteFill}
            />
          }
          style={StyleSheet.absoluteFill}
        >
          <BlurView
            intensity={14}
            tint={
              Platform.OS === "ios"
                ? colorScheme === "dark"
                  ? "systemChromeMaterialDark"
                  : "systemChromeMaterialLight"
                : colorScheme === "dark"
                ? "systemMaterialDark"
                : "systemMaterialLight"
            }
            style={StyleSheet.absoluteFill}
          />
        </MaskedView>
        {children}
      </Reanimated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    width: "100%",
    paddingTop: 12,
  },
});

AnimatedBlurInputWrapper.displayName = "AnimatedBlurInputWrapper";
