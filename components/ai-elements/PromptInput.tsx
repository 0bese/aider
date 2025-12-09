import { useChatContext } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { memo, useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { PromptInputContext } from "./contexts";
import { Attachment } from "./types";

export const PromptInput = memo<{
  children: React.ReactNode;
  multiple?: boolean;
  globalDrop?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}>(
  ({
    children,
    multiple = false,
    globalDrop = false,
    className,
    value,
    onValueChange,
  }) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [internalInput, setInternalInput] = useState("");
    const [inputHeight, setInputHeight] = useState(56);

    const isControlled = value !== undefined;
    const input = isControlled ? value : internalInput;

    const setInput = useCallback(
      (newValue: string | ((prev: string) => string)) => {
        if (isControlled) {
          if (typeof newValue === "function") {
            // We can't easily support functional updates with the simple onValueChange prop
            // so we'll just call it with the current value if possible, but ideally users
            // shouldn't use functional updates with controlled components in this specific context setup if they want full correctness without the state.
            // However, standard React pattern for controlled components is onValueChange(newValue).
            // Let's assume newValue is string for simple cases or handle it best effort.
            // But since we have `value` from props, we can compute it.
            onValueChange?.(newValue(value));
          } else {
            onValueChange?.(newValue);
          }
        } else {
          setInternalInput(newValue);
        }
      },
      [isControlled, onValueChange, value]
    );

    const { sendMessage } = useChatContext();

    const addAttachment = useCallback((a: Attachment) => {
      setAttachments((prev) => [...prev, a]);
    }, []);

    const removeAttachment = useCallback((id: string) => {
      setAttachments((prev) => prev.filter((x) => x.id !== id));
    }, []);

    const onLayoutChange = useCallback((e: LayoutChangeEvent) => {
      setInputHeight(e.nativeEvent.layout.height);
    }, []);

    const submit = useCallback(() => {
      if (!input.trim() && attachments.length === 0) return;

      // Convert to structure expected by ChatContext/ChatPage
      sendMessage({
        role: "user",
        parts: [
          ...attachments.map((a) => ({
            ...a,
            mediaType: a.type,
            type: "file",
          })),
          { type: "text", text: input },
        ],
      });

      setInput("");
      setAttachments([]);
    }, [input, attachments, sendMessage]);

    const contextValue = useMemo(
      () => ({
        input,
        setInput,
        attachments,
        addAttachment,
        removeAttachment,
        inputHeight,
        onLayoutChange,
        submit,
      }),
      [
        input,
        attachments,
        inputHeight,
        addAttachment,
        removeAttachment,
        onLayoutChange,
        submit,
      ]
    );

    return (
      <PromptInputContext.Provider value={contextValue}>
        <View className={cn("", className)}>
          <View className="px-4 py-3 gap-3 flex-row items-end">{children}</View>
        </View>
      </PromptInputContext.Provider>
    );
  }
);
PromptInput.displayName = "PromptInput";
