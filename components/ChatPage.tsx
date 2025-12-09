import {
  Conversation,
  ConversationContent,
  Message,
  PromptInput,
  PromptInputAttachmentButton,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  Suggestion,
  Suggestions,
} from "@/components/ai-elements";
import { AnimatedBlurInputWrapper } from "@/components/AnimatedBlurInputWrapper";
import { MessageRenderer } from "@/components/MessageRenderer";
import { Text } from "@/components/ui/text";
import { useChatContext } from "@/contexts/ChatContext";
import { useKeyboardAnimation } from "@/hooks/useKeyboardAnimation";
import { useHeaderHeight } from "@react-navigation/elements";
import { useCallback, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import Reanimated, {
  useAnimatedProps,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatPage() {
  const headerHeight = useHeaderHeight();
  const { bottom } = useSafeAreaInsets();
  const { messages, status, error } = useChatContext();
  const [input, setInput] = useState("");

  const scrollRef = useRef<Reanimated.FlatList<any>>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const contentOverflows = contentHeight > layoutHeight - bottom;

  const {
    height: keyboardHeight,
    inset,
    offset,
    onScroll,
  } = useKeyboardAnimation();

  const lastAssistantMessageIndex = useMemo(() => {
    return messages.map((m) => m.role).lastIndexOf("assistant");
  }, [messages]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
  }, []);

  const scrollAnimatedProps = useAnimatedProps(() => ({
    contentInset: {
      bottom: inset.value,
    },
    contentOffset: {
      x: 0,
      y: contentOverflows ? offset.value : 0,
    },
  }));

  const inputContainerStyle = useAnimatedStyle(
    () => ({
      bottom: -bottom, // Start with counteracting the bottom inset
      transform: [
        {
          translateY: -keyboardHeight.value,
        },
      ],
    }),
    [bottom]
  );

  const scrollToBottom = useCallback(() => {
    // @ts-ignore
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        {/* @ts-ignore */}
        <Text className="text-red-600 text-center">{error.message}</Text>
      </View>
    );
  }

  return (
    <KeyboardGestureArea
      offset={0}
      style={{ flex: 1 }}
      textInputNativeID="chat-input"
    >
      <Conversation>
        <ConversationContent
          ref={scrollRef}
          renderItem={({ item, index }: any) => (
            <Message key={item.id} from={item.role as any}>
              <MessageRenderer
                message={item}
                index={index}
                lastAssistantMessageIndex={lastAssistantMessageIndex}
              />
            </Message>
          )}
          animatedProps={scrollAnimatedProps}
          onScroll={onScroll}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120, // Check if this needs adjustment
            paddingTop: headerHeight + 16,
            gap: 24,
          }}
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
          keyboardDismissMode="interactive"
          scrollEventThrottle={16}
          onContentSizeChange={(w: number, h: number) => {
            setContentHeight(h);
            scrollToBottom();
          }}
          onLayout={(e: any) => setLayoutHeight(e.nativeEvent.layout.height)}
        />
      </Conversation>

      <AnimatedBlurInputWrapper style={inputContainerStyle}>
        {messages.length === 0 && input === "" && (
          <Suggestions className="px-4 mb-1">
            <Suggestion
              suggestion="What's the weather?"
              onClick={() => handleSuggestionClick("What's the weather?")}
            />
            <Suggestion
              suggestion="Tell me a joke"
              onClick={() => handleSuggestionClick("Tell me a joke")}
            />
            <Suggestion
              suggestion="Explain React Native"
              onClick={() => handleSuggestionClick("Explain React Native")}
            />
          </Suggestions>
        )}

        <PromptInput multiple value={input} onValueChange={setInput}>
          <PromptInputAttachmentButton />
          <PromptInputBody>
            <View className="flex-1">
              <PromptInputAttachments />
              <View className="flex-row items-end">
                <PromptInputTextarea
                  nativeID="chat-input"
                  placeholder="Say something…"
                  returnKeyType="send"
                  blurOnSubmit={false}
                />
                <PromptInputSubmit />
              </View>
            </View>
          </PromptInputBody>
        </PromptInput>
      </AnimatedBlurInputWrapper>
    </KeyboardGestureArea>
  );
}
