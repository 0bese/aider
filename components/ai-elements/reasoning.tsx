import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { ReasoningContext, useReasoningCtx } from "./contexts";

export const Reasoning = memo<{
  children: React.ReactNode;
  duration?: number | string | undefined;
  className?: string;
}>(({ children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const value = useMemo(() => ({ isOpen, setIsOpen }), [isOpen]);

  return (
    <ReasoningContext.Provider value={value}>
      <View className={cn("mb-2", className)}>{children}</View>
    </ReasoningContext.Provider>
  );
});
Reasoning.displayName = "Reasoning";

export const ReasoningTrigger = memo<{ className?: string }>(
  ({ className }) => {
    const { isOpen, setIsOpen } = useReasoningCtx();

    const handlePress = useCallback(() => {
      setIsOpen(!isOpen);
    }, [isOpen, setIsOpen]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        className={cn(
          "flex-row items-center gap-2 rounded-lg bg-blue-50 px-3 py-2",
          className
        )}
      >
        <FontAwesome5 name="brain" size={24} color="#3B82F6" />
        <Text className="text-sm text-blue-600">Show reasoning</Text>
      </TouchableOpacity>
    );
  }
);
ReasoningTrigger.displayName = "ReasoningTrigger";

export const ReasoningContent = memo<{
  children: string;
  className?: string;
}>(({ children, className }) => {
  const { isOpen } = useReasoningCtx();

  if (!isOpen) return null;

  return (
    <View className={cn("mt-2 rounded-lg bg-blue-50 p-3", className)}>
      <Text className="text-sm text-blue-900">{children}</Text>
    </View>
  );
});
ReasoningContent.displayName = "ReasoningContent";
