import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import React, { memo } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
export const Suggestions = memo<{
  children: React.ReactNode;
  className?: string;
}>(({ children, className }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
    className={cn("bg-background", className)}
  >
    {children}
  </ScrollView>
));
Suggestions.displayName = "Suggestions";

export const Suggestion = memo<{
  suggestion: string;
  onClick: () => void;
  className?: string;
}>(({ suggestion, onClick, className }) => (
  <TouchableOpacity
    onPress={onClick}
    className={cn(
      "rounded-lg border border-gray-300 bg-white px-3 py-2 self-start",
      className
    )}
    style={{ minHeight: 36 }}
  >
    <Text className="text-sm text-gray-700" numberOfLines={1}>
      {suggestion}
    </Text>
  </TouchableOpacity>
));
Suggestion.displayName = "Suggestion";
