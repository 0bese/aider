// MessageRenderer.tsx

import {
  MessageAction,
  MessageActions,
  MessageAttachments,
  MessageContent,
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
  Response,
  Source,
  SourceContent,
  SourceTrigger,
} from "@/components/ai-elements";
import { Text } from "@/components/ui/text";
import { useChatContext } from "@/contexts/ChatContext";
import { useCopyContext } from "@/contexts/CopyContext";
import {
  extractAttachments,
  extractReasoning,
  extractSources,
  extractToolCalls,
  getTextContent,
} from "@/lib/chat-utils";
import { Feather, Ionicons } from "@expo/vector-icons";
import { UIMessage } from "ai";
import { memo, useMemo } from "react";
import { View } from "react-native";
import * as ContextMenu from "zeego/context-menu";

interface MessageRendererProps {
  message: UIMessage;
  index: number;
  lastAssistantMessageIndex: number;
}

export const MessageRenderer = memo<MessageRendererProps>(
  ({ message, index, lastAssistantMessageIndex }) => {
    const { copiedMessageId, handleCopyMessage } = useCopyContext();
    const { status, regenerate } = useChatContext();

    const sources = useMemo(
      () => extractSources(message.parts),
      [message.parts]
    );
    const reasoning = useMemo(
      () => extractReasoning(message.parts),
      [message.parts]
    );
    const textContent = useMemo(
      () => getTextContent(message.parts),
      [message.parts]
    );
    const attachments = useMemo(
      () => extractAttachments(message.parts),
      [message.parts]
    );
    const toolCalls = useMemo(
      () => extractToolCalls(message.parts),
      [message.parts]
    );

    const isLastAssistantMessage = index === lastAssistantMessageIndex;
    const isStreaming = status === "streaming";
    const shouldShowActions = !(isLastAssistantMessage && isStreaming);

    switch (message.role) {
      case "assistant":
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

            {toolCalls.length > 0 && (
              <View className="gap-2 mb-2">
                {toolCalls.map((tc) => (
                  <View
                    key={tc.toolCallId}
                    className="rounded-md border border-gray-200 p-2 bg-white/50 dark:bg-black/20"
                  >
                    <Text className="font-medium">
                      {tc.name} · {tc.state}
                      {tc.providerExecuted ? " · executed" : ""}
                    </Text>

                    {tc.state === "input-streaming" && tc.input != null && (
                      <Text className="text-xs text-gray-600 mt-1">
                        Input (streaming): {stringifyForDisplay(tc.input)}
                      </Text>
                    )}

                    {tc.state === "input-available" && tc.input != null && (
                      <Text className="text-xs text-gray-600 mt-1">
                        Input: {stringifyForDisplay(tc.input)}
                      </Text>
                    )}

                    {tc.state === "output-available" && tc.output != null && (
                      <Text className="text-xs text-gray-600 mt-1">
                        Output: {stringifyForDisplay(tc.output)}
                      </Text>
                    )}

                    {tc.state === "output-error" && (
                      <Text className="text-xs text-red-600 mt-1">
                        Error: {tc.errorText ?? "Unknown error"}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
            {attachments.length > 0 && (
              <MessageAttachments attachments={attachments} />
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
                    <MessageAction onPress={regenerate}>
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
                attachments={attachments}
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
                  <ContextMenu.ItemIcon ios={{ name: "doc.on.doc" }} />
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
  }
);

MessageRenderer.displayName = "MessageRenderer";

/**
 * Helper to safely stringify tool input/output for display without throwing.
 * Avoids huge blobs by truncating strings; keeps JSON readable.
 */
function stringifyForDisplay(value: unknown): string {
  try {
    if (typeof value === "string") {
      return value.length > 500 ? value.slice(0, 500) + "…" : value;
    }
    return JSON.stringify(value, (_key, val) =>
      typeof val === "string" && val.length > 500
        ? val.slice(0, 500) + "…"
        : val
    );
  } catch {
    return String(value);
  }
}
