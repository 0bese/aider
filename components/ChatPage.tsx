import { buildMessageParts, generateAPIUrl, MessagePart } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { DefaultChatTransport } from "ai";
import * as Clipboard from "expo-clipboard";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ContextMenu from "zeego/context-menu";
import {
  Attachment,
  Conversation,
  ConversationContent,
  Message,
  MessageAction,
  MessageActions,
  MessageAttachments,
  MessageContent,
  PromptInput,
  PromptInputAttachmentButton,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputMessage,
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

// Types
interface MessagePartData {
  type: string;
  text?: string;
  url?: string;
  title?: string;
  sourceId?: string;
  providerMetadata?: {
    duration?: number;
  };
  mediaType?: string;
  name?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts: MessagePartData[];
}

interface SourceData {
  href?: string;
  title: string;
  description?: string;
  sourceId?: string;
}

interface ReasoningData {
  content: string;
  duration?: number;
}

// Constants
const SCROLL_DELAY = 100;
const SCROLL_INTERVAL = 100;
const COPY_FEEDBACK_DURATION = 500;

export default function ChatPage() {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    onError: (e) => console.error("Chat error:", e),
  });

  const lastAssistantMessageIndex = useMemo(() => {
    return messages.map((m) => m.role).lastIndexOf("assistant");
  }, [messages]);

  // Auto-scroll on new messages
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, SCROLL_DELAY);

    return () => clearTimeout(timer);
  }, [messages, chatStatus]);

  // Continuous scroll during streaming
  useEffect(() => {
    if (chatStatus === "streaming") {
      const scrollInterval = setInterval(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }, SCROLL_INTERVAL);

      return () => clearInterval(scrollInterval);
    }
  }, [chatStatus]);

  // Handler for sending messages with attachments
  const handleSendMessage = useCallback(
    async (message: PromptInputMessage) => {
      const { text = "", files = [] } = message;

      // Don't send if both text and files are empty
      if (!text.trim() && files.length === 0) return;

      try {
        setIsSubmitting(true);

        // Build message parts from text and attachments
        const parts: MessagePart[] = await buildMessageParts(text, files);

        // Don't send if no parts were generated
        if (parts.length === 0) return;

        // Send message with parts
        sendMessage({
          role: "user",
          parts,
        });

        // Clear input
        setInput("");
      } catch (error) {
        console.error("Error sending message:", error);
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "Failed to send message. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [sendMessage]
  );

  const handleCopyMessage = useCallback(
    async (text: string, messageId: string) => {
      try {
        await Clipboard.setStringAsync(text);
        setCopiedMessageId(messageId);

        setTimeout(() => {
          setCopiedMessageId(null);
        }, COPY_FEEDBACK_DURATION);
      } catch (error) {
        console.error("Failed to copy message:", error);
      }
    },
    []
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      handleSendMessage({ text: suggestion, files: [] });
    },
    [handleSendMessage]
  );

  // Message content extractors
  const extractSources = useCallback(
    (parts: MessagePartData[]): SourceData[] => {
      return parts
        .filter(
          (part) =>
            part.type === "source-url" || part.type === "source-document"
        )
        .map((part) => ({
          href: part.type === "source-url" ? part.url : undefined,
          title: part.title || "Source",
          description: part.text,
          sourceId: part.sourceId,
        }));
    },
    []
  );

  const extractReasoning = useCallback(
    (parts: MessagePartData[]): ReasoningData | null => {
      const reasoningPart = parts.find((part) => part.type === "reasoning");

      if (reasoningPart) {
        return {
          content: reasoningPart.text || "",
          duration: reasoningPart.providerMetadata?.duration,
        };
      }

      return null;
    },
    []
  );

  const getTextContent = useCallback((parts: MessagePartData[]): string => {
    return parts
      .filter((part) => part.type === "text")
      .map((part) => part.text || "")
      .join("");
  }, []);

  const extractAttachments = useCallback((parts: MessagePartData[]): Attachment[] => {
    return parts
      .filter((part) => part.type === "file" || part.type === "image")
      .map((part, index) => ({
        id: `att-${index}`,
        name: part.name || "Attachment",
        size: 0,
        type: part.mediaType || "application/octet-stream",
        uri: part.url || "",
      }));
  }, []);

  // Render message content based on role
  const renderMessageContent = useCallback(
    (message: ChatMessage, index: number) => {
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
                      onPress={() => console.log("Audio not implemented")}
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
              <View className="items-end max-w-[80%]">
                <MessageAttachments
                  attachments={extractAttachments(message.parts)}
                  className="items-end"
                />
              </View>
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
    },
    [
      chatStatus,
      copiedMessageId,
      extractReasoning,
      extractSources,
      getTextContent,
      handleCopyMessage,
      lastAssistantMessageIndex,
      regenerate,
    ]
  );

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-600 text-center">{error.message}</Text>
      </View>
    );
  }

  const effectiveStatus = isSubmitting ? "submitted" : chatStatus;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 20}
    >
      <Conversation scrollRef={scrollRef}>
        <ConversationContent>
          {messages.map((message, index) => (
            <Message from={message.role} key={message.id}>
              {renderMessageContent(message as ChatMessage, index)}
            </Message>
          ))}
        </ConversationContent>
      </Conversation>

      <View className="bg-background" style={{ paddingBottom: 10 + bottom }}>
        {messages.length === 0 && (
          <Suggestions className="px-4 mb-2">
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

        <PromptInput onSubmit={handleSendMessage} multiple>
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
                  editable={!isSubmitting}
                  onSubmitEditing={() => {
                    if (input.trim() && effectiveStatus === "ready") {
                      handleSendMessage({ text: input, files: [] });
                    }
                  }}
                />
                <PromptInputSubmit
                  status={effectiveStatus}
                  disabled={isSubmitting || effectiveStatus !== "ready"}
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
