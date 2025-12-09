import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import React, { memo } from "react";
import { View } from "react-native";
import { MessageRole } from "./types";

export const Response = memo<{
  children: string;
  from?: MessageRole;
  className?: string;
}>(({ children, className }) => (
  <View className={cn("flex-shrink", className)}>
    <Text>{children}</Text>
  </View>
));
Response.displayName = "Response";
