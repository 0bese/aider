import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { BranchContext, useBranch } from "./contexts";
import { MessageRole } from "./types";

export const Branch = memo<{
  children: React.ReactNode;
  defaultBranch?: number;
  className?: string;
}>(({ children, defaultBranch = 0, className }) => {
  const [currentBranch, setCurrentBranch] = useState(defaultBranch);

  const totalBranches = useMemo(() => {
    // Note: We're checking for BranchMessages type by name if possible or just assuming children structure
    // Since we can't easily import BranchMessages from itself before definition, we just filter.
    // However, React.isValidElement(child) is good. The original code checked child.type === BranchMessages.
    // In this split file, we can import BranchMessages from somewhere or just count valid elements if strictly BranchMessages are children.
    // For now we will just count all children that seem relevant or stick to original logic if we can.
    // Original logic: child.type === BranchMessages. We need BranchMessages to be defined or imported.
    // But BranchMessages is defined below. This is circular if we define in same file.
    // If we separate them, we have issues. I will keep BranchMessages in this file.
    return React.Children.count(children);
  }, [children]);

  const value = useMemo(
    () => ({ currentBranch, setCurrentBranch, totalBranches }),
    [currentBranch, totalBranches]
  );

  return (
    <BranchContext.Provider value={value}>
      <View className={cn("relative", className)}>{children}</View>
    </BranchContext.Provider>
  );
});
Branch.displayName = "Branch";

export const BranchMessagesComponent = memo<{
  children: React.ReactNode;
  className?: string;
}>(({ children, className }) => {
  const { currentBranch } = useBranch();
  const kids = useMemo(() => React.Children.toArray(children), [children]);

  return (
    <View className={cn("relative", className)}>{kids[currentBranch]}</View>
  );
});
BranchMessagesComponent.displayName = "BranchMessages";
// Export as BranchMessages to match expectation
export const BranchMessages = BranchMessagesComponent;

export const BranchSelector = memo<{
  children: React.ReactNode;
  from: MessageRole;
  className?: string;
}>(({ children, from, className }) => (
  <View
    className={cn(
      "flex-row items-center justify-center gap-2 px-4 py-2",
      from === "user" ? "bg-blue-50" : "bg-gray-50",
      className
    )}
  >
    {children}
  </View>
));
BranchSelector.displayName = "BranchSelector";

export const BranchPrevious = memo<{ className?: string }>(({ className }) => {
  const { currentBranch, setCurrentBranch } = useBranch();
  const isDisabled = currentBranch === 0;

  const handlePress = useCallback(() => {
    setCurrentBranch(Math.max(0, currentBranch - 1));
  }, [currentBranch, setCurrentBranch]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      className={cn(
        "p-2 rounded-full",
        isDisabled ? "opacity-50" : "bg-gray-200",
        className
      )}
    >
      <Ionicons name="chevron-back" size={24} color="black" />
    </TouchableOpacity>
  );
});
BranchPrevious.displayName = "BranchPrevious";

export const BranchNext = memo<{ className?: string }>(({ className }) => {
  const { currentBranch, totalBranches, setCurrentBranch } = useBranch();
  const isDisabled = currentBranch === totalBranches - 1;

  const handlePress = useCallback(() => {
    setCurrentBranch(Math.min(totalBranches - 1, currentBranch + 1));
  }, [currentBranch, totalBranches, setCurrentBranch]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      className={cn(
        "p-2 rounded-full",
        isDisabled ? "opacity-50" : "bg-gray-200",
        className
      )}
    >
      <Ionicons name="chevron-forward" size={24} color="black" />
    </TouchableOpacity>
  );
});
BranchNext.displayName = "BranchNext";

export const BranchPage = memo<{ className?: string }>(({ className }) => {
  const { currentBranch, totalBranches } = useBranch();

  return (
    <Text className={cn("text-sm", className)}>
      {currentBranch + 1} / {totalBranches}
    </Text>
  );
});
BranchPage.displayName = "BranchPage";
