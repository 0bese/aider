import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import React, { memo, useMemo } from "react";
import {
  Image,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { MessageContext, useMessage } from "./contexts";
import { MessageRole } from "./types";

export const Message = memo<{
  children: React.ReactNode;
  from: MessageRole;
  className?: string;
}>(({ children, from, className }) => {
  const value = useMemo(() => ({ from }), [from]);

  return (
    <MessageContext.Provider value={value}>
      <View
        className={cn(
          "w-full",
          from === "user" ? "items-end" : "items-start",
          className
        )}
      >
        {children}
      </View>
    </MessageContext.Provider>
  );
});
Message.displayName = "Message";

export const MessageContent = memo<{
  children: React.ReactNode;
  from?: MessageRole;
  className?: string;
}>(({ children, from, className }) => {
  const messageContext = useMessage();
  const messageFrom = from || messageContext.from;

  return (
    <View
      className={cn(
        messageFrom === "user"
          ? "rounded-2xl bg-gray-100 dark:bg-neutral-900 px-5 py-3"
          : "w-full",
        "self-end",
        className
      )}
    >
      {children}
    </View>
  );
});
MessageContent.displayName = "MessageContent";

export const MessageAvatar = memo<{
  src?: string;
  name: string;
  className?: string;
}>(({ src, name, className }) => (
  <View className={cn("h-8 w-8 overflow-hidden rounded-full", className)}>
    {src ? (
      <Image source={{ uri: src }} className="h-full w-full" />
    ) : (
      <View className="h-full w-full items-center justify-center bg-gray-300">
        <Text className="text-sm font-medium">
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
    )}
  </View>
));
MessageAvatar.displayName = "MessageAvatar";

export const MessageActions = memo<{
  children: React.ReactNode;
  className?: string;
}>(({ children, className }) => {
  const { from } = useMessage();

  if (from === "user") return null;

  return (
    <View className={cn("flex-row items-center gap-2 mt-2", className)}>
      {children}
    </View>
  );
});
MessageActions.displayName = "MessageActions";

export const MessageAction = memo<
  {
    children: React.ReactNode;
    className?: string;
  } & TouchableOpacityProps
>(({ children, className, ...rest }) => (
  <TouchableOpacity
    className={cn(
      "rounded-lg bg-gray-50 dark:bg-neutral-900 p-2 active:bg-gray-200",
      className
    )}
    {...rest}
  >
    {children}
  </TouchableOpacity>
));
MessageAction.displayName = "MessageAction";
