import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  BottomSheet,
  ContextMenu,
  Host,
  HStack,
  Picker,
  Button as SwiftButton,
  Text as SwiftText,
  Switch,
  VStack,
} from "@expo/ui/swift-ui";
import { cornerRadius, frame, padding } from "@expo/ui/swift-ui/modifiers";
import { Link } from "expo-router";
import { Camera } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
// import { GLView } from 'expo-gl';
export default function Index() {
  const { width, height } = useWindowDimensions();
  const [isOpened, setIsOpened] = useState(false);
  const images = [
    {
      id: 1,
      img: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format",
    },
    {
      id: 2,
      img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format",
    },
    {
      id: 3,
      img: "https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format",
    },
    {
      id: 4,
      img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format",
    },
  ];
  const demo = [
    { id: "1", name: "Red", color: "#ef4444" },
    { id: "2", name: "Orange", color: "#f97316" },
    { id: "3", name: "Yellow", color: "#f59e0b" },
    { id: "4", name: "Green", color: "#10b981" },
    // { id: "5", name: "Blue", color: "#3b82f6" },
    // { id: "6", name: "Purple", color: "#8b5cf6" },
  ];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [checked, setChecked] = useState(false);
  return (
    <View className="flex-1 items-center justify-center">
      <Link href={"/(drawer)"}>Drawer</Link>
      <Link href={"/image-gen"} style={{ marginTop: 10, color: 'white', fontWeight: 'bold' }}>Go to Image Generation</Link>
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button
        className="rounded-full"
        variant={"default"}
        size={"sm"}
        onPress={() => setIsOpened(true)}
      >
        <Text> OPEN BOTTOM SHEET</Text>
      </Button>

      {/* Place the sheet inside the same Host */}
      <Host matchContents>
        <BottomSheet
          presentationDetents={[0.4, 0.6]}
          isOpened={isOpened}
          onIsOpenedChange={(next) => setIsOpened(next)}
        >
          <VStack spacing={8}>
            <SwiftButton
              variant="bordered"
              onPress={() => {
                console.log("pressed");
                setIsOpened(false);
              }}
              modifiers={[
                cornerRadius(12),
                padding({ all: 20 }),
                frame({ width: 112, height: 112 }), // ~30 % / 31 %
              ]}
              // systemImage="arrow.up.message"
            >
              <VStack alignment="center" spacing={8}>
                {/* {icon} */}
                <Camera color={"#a3a3a3"} />
                <SwiftText color="secondary">Tester</SwiftText>
              </VStack>
            </SwiftButton>
            <SwiftText>Hello, world!</SwiftText>
            <HStack>
              <SwiftButton
                // modifiers={}
                systemImage="d.circle.fill"
                onPress={() => setIsOpened(false)}
              >
                Close
              </SwiftButton>
              <SwiftButton onPress={() => setIsOpened(false)}>
                Close
              </SwiftButton>
            </HStack>
          </VStack>
        </BottomSheet>
      </Host>

      <Host style={{ width: 150, height: 50 }} matchContents>
        <ContextMenu>
          <ContextMenu.Items>
            <SwiftButton
              systemImage="person.crop.circle.badge.xmark"
              onPress={() => console.log("Pressed1")}
            >
              Hello
            </SwiftButton>
            <SwiftButton
              variant="bordered"
              systemImage="plus.circle"
              onPress={() => console.log("Pressed2")}
            >
              Love it
            </SwiftButton>
            <Picker
              label="Doggos"
              options={["very", "veery", "veeery", "much"]}
              variant="menu"
              selectedIndex={selectedIndex}
              onOptionSelected={({ nativeEvent: { index } }) =>
                setSelectedIndex(index)
              }
            />
            <Switch
              value={checked}
              onValueChange={(checked) => {
                setChecked(checked);
              }}
              color="#ff0000"
              label="Play music"
              variant="switch"
            />
          </ContextMenu.Items>
          <ContextMenu.Trigger>
            <SwiftButton variant="bordered">Show Menu</SwiftButton>
          </ContextMenu.Trigger>
        </ContextMenu>
      </Host>

      <View className="mt-36">
        {/* <CardStack
          data={images}
          initialIndex={1}
          cardDimensions={{ width: 210, height: 270 }}
          renderItem={(item) => (
            <View style={appStyles.imageCard}>
              <Image
                source={{ uri: item.img }}
                style={appStyles.image}
                contentFit="cover"
              />
            </View>
          )}
        /> */}
      </View>
    </View>
  );
}

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
