import { generateAPIUrl } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { DefaultChatTransport } from "ai";
import * as Clipboard from "expo-clipboard";
import { fetch as expoFetch } from "expo/fetch";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ContextMenu from "zeego/context-menu";
import {
  Conversation,
  ConversationContent,
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  PromptInput,
  PromptInputAttachmentButton,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
  Response,
  Source,
  SourceContent,
  SourceTrigger,
  Suggestion,
  Suggestions
} from "./ai-elements";

export default function ChatPage() {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const { bottom } = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const {
    messages,
    error,
    sendMessage,
    regenerate,
    status: chatStatus,
  } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
    onError: (e) => console.error(e),
  });

  const lastAssistantMessageIndex = messages
    .map((m) => m.role)
    .lastIndexOf("assistant");

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, chatStatus]);

  useEffect(() => {
    if (chatStatus === "streaming") {
      const scrollInterval = setInterval(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }, 100);
      return () => clearInterval(scrollInterval);
    }
  }, [chatStatus]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    sendMessage({ text });
    setInput("");
  };

  const handleCopyMessage = async (text: string, messageId: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 500);
  };

  // Helper functions
  const extractSources = (parts: any[]) => {
    return parts
      .filter(
        (part) => part.type === "source-url" || part.type === "source-document"
      )
      .map((part) => ({
        href: part.type === "source-url" ? part.url : undefined,
        title: part.title || "Source",
        description: part.text,
        sourceId: part.sourceId,
      }));
  };

  const extractReasoning = (parts: any[]) => {
    const reasoningPart = parts.find((part) => part.type === "reasoning");
    if (reasoningPart) {
      return {
        content: reasoningPart.text,
        duration: reasoningPart.providerMetadata?.duration,
      };
    }
    return null;
  };

  const getTextContent = (parts: any[]) => {
    return parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
  };

  // Render message content based on role
  const renderMessageContent = (message: any, index: number) => {
    const sources = extractSources(message.parts);
    const reasoning = extractReasoning(message.parts);
    const textContent = getTextContent(message.parts);
    const isLastAssistantMessage = index === lastAssistantMessageIndex;
    const isStreaming = chatStatus === "streaming";

    switch (message.role) {
      case "assistant":
        const shouldShowActions = !(isLastAssistantMessage && isStreaming);

        return (
          <View>
            {sources.length > 0 && (
              <View className="gap-2 mb-2">
                {sources.map((source) => (
                  <Source href={source.href} key={source.sourceId}>
                    <SourceTrigger showFavicon />
                    <SourceContent
                      title={source.title}
                      description={source.description}
                    />
                  </Source>
                ))}
              </View>
            )}
            {reasoning && (
              <Reasoning duration={reasoning.duration}>
                <ReasoningTrigger />
                <ReasoningContent>{reasoning.content}</ReasoningContent>
              </Reasoning>
            )}
            <MessageContent>
              <Response>{textContent}</Response>

              {shouldShowActions && (
                <MessageActions>
                  <MessageAction
                    onPress={() => handleCopyMessage(textContent, message.id)}
                  >
                    <Ionicons
                      name={
                        copiedMessageId === message.id
                          ? "checkmark"
                          : "copy-outline"
                      }
                      size={16}
                      color={
                        copiedMessageId === message.id ? "#10B981" : "#6B7280"
                      }
                    />
                  </MessageAction>

                  {isLastAssistantMessage && (
                    <MessageAction onPress={() => regenerate()}>
                      <Feather name="refresh-ccw" size={16} color="#6B7280" />
                    </MessageAction>
                  )}

                  <MessageAction
                    onPress={() => {
                      /* handle audio */
                    }}
                  >
                    <Ionicons
                      name="volume-medium-outline"
                      size={16}
                      color="#6B7280"
                    />
                  </MessageAction>
                </MessageActions>
              )}
            </MessageContent>
          </View>
        );

      case "user":
        return (
          <View className="max-w-[80%]">
            <ContextMenu.Root>
              <ContextMenu.Trigger asChild className="shadow-white">
                <MessageContent>
                  <Response>{textContent}</Response>
                </MessageContent>
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                <ContextMenu.Item
                  key="copy"
                  onSelect={() => handleCopyMessage(textContent, message.id)}
                >
                  <ContextMenu.ItemIcon
                    ios={{
                      name: "doc.on.doc",
                    }}
                  />
                  <ContextMenu.ItemTitle>Copy</ContextMenu.ItemTitle>
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Root>
          </View>
        );

      case "system":
        return (
          <MessageContent>
            <Text className="italic text-gray-600">{textContent}</Text>
          </MessageContent>
        );

      default:
        return (
          <MessageContent>
            <Response>{textContent}</Response>
          </MessageContent>
        );
    }
  };

  if (error) return <Text className="text-red-600 p-4">{error.message}</Text>;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <Conversation scrollRef={scrollRef}>
        <ConversationContent>
          {messages.map((message, index) => (
            <Message from={message.role} key={message.id}>
              {renderMessageContent(message, index)}
            </Message>
          ))}
        </ConversationContent>
      </Conversation>

      <View className="bg-background" style={{ paddingBottom: 10 + bottom }}>
        {messages.length === 0 && (
          <Suggestions className="px-4 mb-2">
            <Suggestion
              suggestion="What's the weather?"
              onClick={() => handleSendMessage("What's the weather?")}
            />
            <Suggestion
              suggestion="Tell me a joke"
              onClick={() => handleSendMessage("Tell me a joke")}
            />
          </Suggestions>
        )}

<PromptInput onSubmit={(msg) => handleSendMessage(msg.text!)} multiple>
  <PromptInputAttachmentButton />
  <PromptInputBody>
    <View className="flex-1">
      <PromptInputAttachments />
      <View className="flex-row items-end">
        <PromptInputTextarea
          placeholder="Say something…"
          value={input}
          onChangeText={setInput}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <PromptInputSubmit
          status={chatStatus}
          disabled={!input.trim() || chatStatus !== "ready"}
          value={input.trim()}
        />
      </View>
    </View>
  </PromptInputBody>
</PromptInput>

      </View>
    </KeyboardAvoidingView>
  );
}
