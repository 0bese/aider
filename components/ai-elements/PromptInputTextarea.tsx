import { useChatContext } from "@/contexts/ChatContext";
import { forwardRef, memo } from "react";
import { TextInput, TextInputProps } from "react-native";
import { usePromptInput } from "./contexts";

export const PromptInputTextarea = memo(
  forwardRef<TextInput, TextInputProps>((props, ref) => {
    const { input, setInput, onLayoutChange } = usePromptInput();
    const { status } = useChatContext();

    return (
      <TextInput
        ref={ref}
        multiline
        textAlignVertical="top"
        placeholder="Type your message..."
        placeholderTextColor="#9CA3AF"
        className="max-h-[120px] text-base dark:bg-neutral-800 dark:text-white py-2 px-2 flex-1"
        value={input}
        onChangeText={setInput}
        onLayout={onLayoutChange}
        // @ts-ignore: status type mismatch workaround if needed, or assume compatible string
        editable={status !== "streaming" && status !== "submitted"}
        {...props}
      />
    );
  })
);
PromptInputTextarea.displayName = "PromptInputTextarea";
