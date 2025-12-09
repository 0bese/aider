import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as Linking from "expo-linking";
import React, { memo, useCallback, useMemo } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { SourceContext, useSource } from "./contexts";

export const Source = memo<{
  children: React.ReactNode;
  href?: string;
  className?: string;
}>(({ children, href, className }) => {
  const value = useMemo(() => ({ href }), [href]);

  const handlePress = useCallback(async () => {
    if (!href) return;

    try {
      const supported = await Linking.canOpenURL(href);
      if (supported) {
        await Linking.openURL(href);
      } else {
        console.warn(`Cannot open URL: ${href}`);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  }, [href]);

  return (
    <SourceContext.Provider value={value}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={!href}
        className={cn(
          "flex-row items-start gap-3 rounded-lg bg-green-50 p-3",
          className
        )}
      >
        {children}
      </TouchableOpacity>
    </SourceContext.Provider>
  );
});
Source.displayName = "Source";

export const SourceTrigger = memo<{
  showFavicon?: boolean;
  className?: string;
}>(({ showFavicon, className }) => {
  const { href } = useSource();

  const faviconUrl = useMemo(() => {
    return href
      ? `https://www.google.com/s2/favicons?sz=64&domain_url=${href}`
      : undefined;
  }, [href]);

  if (!showFavicon || !faviconUrl) return null;

  return (
    <View className={cn("flex-row items-center", className)}>
      <Image source={{ uri: faviconUrl }} className="h-5 w-5 rounded" />
    </View>
  );
});
SourceTrigger.displayName = "SourceTrigger";

export const SourceContent = memo<{
  title: string;
  description?: string;
  className?: string;
}>(({ title, description, className }) => (
  <View className={cn("flex-1", className)}>
    <Text className="text-sm font-semibold text-green-900" numberOfLines={1}>
      {title}
    </Text>
    {description && (
      <Text className="text-sm text-green-800 mt-1" numberOfLines={2}>
        {description}
      </Text>
    )}
  </View>
));
SourceContent.displayName = "SourceContent";
