// import { IconSymbol } from "@/app-example/components/ui/icon-symbol.ios";
// import ParallaxScrollView from "@/components/parallaxScrollView";
// import { Text } from "@/components/ui/text";
// import { StyleSheet } from "react-native";

// export default function ProfilePage() {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
//       headerImage={
//         <IconSymbol
//           size={310}
//           color="#808080"
//           name="chevron.left.forwardslash.chevron.right"
//           style={styles.headerImage}
//         />
//       }
//     >
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//       <Text>Profile</Text>
//     </ParallaxScrollView>
//   );
// }

// // <ScrollView contentInsetAdjustmentBehavior="automatic">
// //   <Text>Profile page</Text>
// // </ScrollView>

// const styles = StyleSheet.create({
//   headerImage: {
//     color: "#808080",
//     bottom: -90,
//     left: -35,
//     position: "absolute",
//   },
//   titleContainer: {
//     flexDirection: "row",
//     gap: 8,
//   },
// });

import { Text } from "@/components/ui/text";
import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { Platform, StyleSheet, View } from "react-native";
import { easeGradient } from "react-native-easing-gradient";

export default function ProfilePage() {
  const { colorScheme } = useColorScheme();
  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: "transparent" },
      0.5: {
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
    <View
      style={styles.container}
      className={colorScheme === "dark" ? "bg-black" : "bg-white"}
    >
      <MaskedView
        maskElement={
          <LinearGradient
            locations={locations as any}
            colors={colors as any}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        }
        style={[StyleSheet.absoluteFill]}
      >
        <BlurView
          intensity={15}
          tint={
            Platform.OS === "ios"
              ? colorScheme === "dark"
                ? "systemChromeMaterialDark"
                : "systemChromeMaterialLight"
              : colorScheme === "dark"
              ? "systemMaterialDark"
              : "systemMaterialLight"
          }
          style={[StyleSheet.absoluteFill]}
        />
      </MaskedView>
      <Text className={colorScheme === "dark" ? "text-white" : "text-black"}>
        Profile
      </Text>
      <View className="w-20 h-80 bg-red-300 right-3 top-10 absolute -z-10">
        <Text>Profile</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
    height: 150,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
