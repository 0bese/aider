import { useChatContext } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { memo, useCallback, useMemo } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { usePromptInput } from "./contexts";

export const PromptInputSubmit = memo<{
  className?: string;
}>(({ className }) => {
  const { colorScheme } = useColorScheme();
  const { status } = useChatContext();
  const { input, attachments, submit } = usePromptInput();

  const isDisabled =
    status !== "ready" || (!input.trim() && attachments.length === 0);

  const handlePress = useCallback(() => {
    if (!isDisabled) {
      submit();
    }
  }, [isDisabled, submit]);

  const buttonColor = useMemo(() => {
    if (colorScheme === "light") {
      return isDisabled ? "bg-neutral-300" : "bg-neutral-700";
    }
    return isDisabled ? "bg-neutral-800" : "bg-neutral-700";
  }, [colorScheme, isDisabled]);

  const iconColor = useMemo(() => {
    if (isDisabled) {
      return colorScheme === "light" ? "#a3a3a3" : "#525252";
    }
    return "#fff";
  }, [colorScheme, isDisabled]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      className={cn(
        "rounded-full p-2 justify-center items-center self-end",
        buttonColor,
        className
      )}
    >
      {status === "streaming" || status === "submitted" ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Feather name="arrow-up" size={24} color={iconColor} />
      )}
    </TouchableOpacity>
  );
});
PromptInputSubmit.displayName = "PromptInputSubmit";
