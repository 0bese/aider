import { useChatContext } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import Reanimated from "react-native-reanimated";

export const ConversationContent = forwardRef<
  Reanimated.FlatList<any>,
  Omit<React.ComponentProps<typeof Reanimated.FlatList>, "data"> & {
    className?: string;
  }
>(({ className, ...props }, ref) => {
  const { messages, status } = useChatContext();
  const internalRef = useRef<Reanimated.FlatList<any>>(null);
  const scrollRef = ref || internalRef;

  const scrollToBottom = useCallback(() => {
    if (messages.length > 0) {
      // @ts-ignore
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length, scrollRef]);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (status === "streaming") {
      const scrollInterval = setInterval(() => {
        // @ts-ignore
        scrollRef.current?.scrollToEnd({ animated: false });
      }, 50);
      return () => clearInterval(scrollInterval);
    }
  }, [status, scrollRef]);

  return (
    <Reanimated.FlatList
      // @ts-ignore
      ref={scrollRef}
      className={cn("flex-1", className)}
      data={messages}
      keyExtractor={(item: any) => item.id}
      onContentSizeChange={scrollToBottom}
      {...props}
    />
  );
});
ConversationContent.displayName = "ConversationContent";
