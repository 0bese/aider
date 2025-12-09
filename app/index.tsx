import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Link } from "expo-router";
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
      <Link href={"/(drawer)"}><Text>Drawer</Text></Link>
      <Link href={"/models"}><Text>Models</Text></Link>
      <Link href={"/image-gen"} style={{ marginTop: 10, color: 'white', fontWeight: 'bold' }}><Text>Go to Image Generation</Text></Link>
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button
        className="rounded-full"
        variant={"default"}
        size={"sm"}
        onPress={() => setIsOpened(true)}
      >
        <Text> OPEN BOTTOM SHEET</Text>
      </Button>

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
