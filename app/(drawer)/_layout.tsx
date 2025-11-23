import { Text } from "@/components/ui/text";
import { Chat } from "@/lib/interfaces";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { Link, useNavigation, useRouter } from "expo-router";
import Drawer from "expo-router/drawer";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Alert, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ContextMenu from "zeego/context-menu";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="(chatstack)" />
    </Drawer>
  );
}

export const CustomDrawerContent = (props: any) => {
  const router = useRouter();
  const nav = useNavigation();
  const { bottom, top } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const [history, setHistory] = useState<Chat[]>([
    { id: 1, title: "Sample title" },
    { id: 2, title: "Sample title 2" },
    { id: 3, title: "Sample title 3" },
  ]);

  const onRenameChat = (chatId: number) => {
    Alert.prompt(
      "Rename Chat",
      "Enter a new name for the chat",
      async (newName) => {
        if (newName) {
          // Rename the chat
          // await renameChat(db, chatId, newName);
          // loadChats();
        }
      }
    );
  };

  DrawerActions.closeDrawer;

  const onDeleteChat = (chatId: number) => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // Update local state for demo. Replace with DB calls if needed.
          setHistory((prev) => prev.filter((c) => c.id !== chatId));
          // await deleteChat(db, chatId);
          // loadChats();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, marginTop: top }}>
      <View className="bg-background pb-4">
        <View className="mx-4 h-14 flex-row items-center bg-gray-100 rounded-2xl px-3">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 h-10 ml-2 text-black"
            placeholder="Search"
            underlineColorAndroid="transparent"
          />
        </View>
      </View>

      <DrawerContentScrollView
        {...props}
        className="bg-background"
        contentContainerStyle={{
          paddingTop: 0,
          flex: 1,
        }}
      >
        {/* <DrawerItemList {...props} /> */}

        {history.map((chat) => (
          <ContextMenu.Root key={`chat-root-${chat.id}`}>
            <ContextMenu.Trigger>
              <DrawerItem
                label={chat.title}
                onPress={() => {
                  router.replace(`/(drawer)/(chat)/${chat.id}`);
                  props.navigation.closeDrawer();
                }}
                inactiveTintColor={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </ContextMenu.Trigger>

            <ContextMenu.Content>
              <ContextMenu.Preview
                backgroundColor={{
                  dark: "black",
                  light: "white",
                }}
                isResizeAnimated
              >
                {() => (
                  <View className="p-4 flex bg-">
                    <Text className="dark:text-white">{chat.title}</Text>
                  </View>
                )}
              </ContextMenu.Preview>

              <ContextMenu.Item
                key={`rename-${chat.id}`}
                onSelect={() => onRenameChat(chat.id)}
              >
                <ContextMenu.ItemTitle>Rename</ContextMenu.ItemTitle>
                <ContextMenu.ItemIcon
                  ios={{
                    name: "pencil",
                    pointSize: 18,
                  }}
                />
              </ContextMenu.Item>

              <ContextMenu.Item
                key={`delete-${chat.id}`}
                onSelect={() => onDeleteChat(chat.id)}
                destructive
              >
                <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                <ContextMenu.ItemIcon
                  ios={{
                    name: "trash",
                    pointSize: 18,
                  }}
                />
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Root>
        ))}
      </DrawerContentScrollView>

      <View style={{ padding: 16, paddingBottom: 20 + bottom }}>
        <Link href="/(modal)/settings" asChild>
          <TouchableOpacity className="flex-row items-center gap-4">
            <View className="bg-blue-400 h-8 w-8 rounded-full" />
            <Text className="font-semibold text-lg flex-1">Kojo Obese</Text>
            <Ionicons name="ellipsis-horizontal" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};
