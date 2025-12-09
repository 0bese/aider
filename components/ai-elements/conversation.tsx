import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";

export const Conversation = memo<{
  children: React.ReactNode;
  className?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
}>(({ children, className, onLayout }) => (
  <View className={cn("flex-1", className)} onLayout={onLayout}>
    {children}
  </View>
));
Conversation.displayName = "Conversation";

export const ConversationScrollButton = memo<{ className?: string }>(
  ({ className }) => (
    <TouchableOpacity
      className={cn(
        "absolute bottom-4 right-4 rounded-full bg-blue-500 p-3 shadow-lg",
        className
      )}
    >
      <Ionicons name="arrow-down" size={24} color="white" />
    </TouchableOpacity>
  )
);
ConversationScrollButton.displayName = "ConversationScrollButton";
