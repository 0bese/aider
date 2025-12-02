/**
 * AI Chat Components - Single File Implementation
 * NativeWind + Expo compatible TypeScript components
 * Optimized for performance and type safety
 */

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { AntDesign, Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useColorScheme } from "nativewind";
import React, {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as DropdownMenu from "zeego/dropdown-menu";

/* ---------- TYPES ---------- */
export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
}

export interface PromptInputMessage {
  text?: string;
  files?: Attachment[];
}

type MessageRole = "user" | "assistant" | "system";

interface BranchContextType {
  currentBranch: number;
  setCurrentBranch: (index: number) => void;
  totalBranches: number;
}

interface MessageContextType {
  from: MessageRole;
}

interface ReasoningContextType {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

interface SourceContextType {
  href?: string;
}

interface PromptInputContextType {
  onSubmit: (msg: PromptInputMessage) => void;
  multiple: boolean;
  globalDrop: boolean;
  attachments: Attachment[];
  addAttachment: (a: Attachment) => void;
  removeAttachment: (id: string) => void;
}

/* ---------- CONTEXTS ---------- */
const BranchContext = createContext<BranchContextType | undefined>(undefined);
const MessageContext = createContext<MessageContextType | undefined>(undefined);
const ReasoningContext = createContext<ReasoningContextType | undefined>(
  undefined
);
const SourceContext = createContext<SourceContextType | undefined>(undefined);
const PromptInputContext = createContext<PromptInputContextType | undefined>(
  undefined
);

/* ---------- HOOKS ---------- */
const useBranch = (): BranchContextType => {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranch must be used inside <Branch>");
  return ctx;
};

const useMessage = (): MessageContextType => {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessage must be used inside <Message>");
  return ctx;
};

const useReasoningCtx = (): ReasoningContextType => {
  const ctx = useContext(ReasoningContext);
  if (!ctx) throw new Error("useReasoningCtx must be used inside <Reasoning>");
  return ctx;
};

const useSource = (): SourceContextType => {
  const ctx = useContext(SourceContext);
  if (!ctx) throw new Error("useSource must be used inside <Source>");
  return ctx;
};

const usePromptInput = (): PromptInputContextType => {
  const ctx = useContext(PromptInputContext);
  if (!ctx) throw new Error("usePromptInput must be used inside <PromptInput>");
  return ctx;
};

/* ---------- BRANCH COMPONENTS ---------- */
export const Branch = memo<{
  children: React.ReactNode;
  defaultBranch?: number;
  className?: string;
}>(({ children, defaultBranch = 0, className }) => {
  const [currentBranch, setCurrentBranch] = useState(defaultBranch);

  const totalBranches = useMemo(() => {
    return React.Children.count(
      React.Children.toArray(children).filter(
        (child) => React.isValidElement(child) && child.type === BranchMessages
      )
    );
  }, [children]);

  const value = useMemo(
    () => ({ currentBranch, setCurrentBranch, totalBranches }),
    [currentBranch, totalBranches]
  );

  return (
    <BranchContext.Provider value={value}>
      <View className={cn("relative", className)}>{children}</View>
    </BranchContext.Provider>
  );
});
Branch.displayName = "Branch";

export const BranchMessages = memo<{
  children: React.ReactNode;
  className?: string;
}>(({ children, className }) => {
  const { currentBranch } = useBranch();
  const kids = useMemo(() => React.Children.toArray(children), [children]);

  return (
    <View className={cn("relative", className)}>{kids[currentBranch]}</View>
  );
});
BranchMessages.displayName = "BranchMessages";

export const BranchSelector = memo<{
  children: React.ReactNode;
  from: MessageRole;
  className?: string;
}>(({ children, from, className }) => (
  <View
    className={cn(
      "flex-row items-center justify-center gap-2 px-4 py-2",
      from === "user" ? "bg-blue-50" : "bg-gray-50",
      className
    )}
  >
    {children}
  </View>
));
BranchSelector.displayName = "BranchSelector";

export const BranchPrevious = memo<{ className?: string }>(({ className }) => {
  const { currentBranch, setCurrentBranch } = useBranch();
  const isDisabled = currentBranch === 0;

  const handlePress = useCallback(() => {
    setCurrentBranch(Math.max(0, currentBranch - 1));
  }, [currentBranch, setCurrentBranch]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      className={cn(
        "p-2 rounded-full",
        isDisabled ? "opacity-50" : "bg-gray-200",
        className
      )}
    >
      <Ionicons name="chevron-back" size={24} color="black" />
    </TouchableOpacity>
  );
});
BranchPrevious.displayName = "BranchPrevious";

export const BranchNext = memo<{ className?: string }>(({ className }) => {
  const { currentBranch, totalBranches, setCurrentBranch } = useBranch();
  const isDisabled = currentBranch === totalBranches - 1;

  const handlePress = useCallback(() => {
    setCurrentBranch(Math.min(totalBranches - 1, currentBranch + 1));
  }, [currentBranch, totalBranches, setCurrentBranch]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      className={cn(
        "p-2 rounded-full",
        isDisabled ? "opacity-50" : "bg-gray-200",
        className
      )}
    >
      <Ionicons name="chevron-forward" size={24} color="black" />
    </TouchableOpacity>
  );
});
BranchNext.displayName = "BranchNext";

export const BranchPage = memo<{ className?: string }>(({ className }) => {
  const { currentBranch, totalBranches } = useBranch();

  return (
    <Text className={cn("text-sm text-gray-600", className)}>
      {currentBranch + 1} / {totalBranches}
    </Text>
  );
});
BranchPage.displayName = "BranchPage";

/* ---------- CONVERSATION COMPONENTS ---------- */
export const Conversation = memo<{
  children: React.ReactNode;
  className?: string;
  scrollRef?: React.RefObject<ScrollView | null>;
}>(({ children, className, scrollRef }) => (
  <ScrollView
    ref={scrollRef}
    className={cn("flex-1 bg-background", className)}
    showsVerticalScrollIndicator={false}
    automaticallyAdjustContentInsets
  >
    {children}
  </ScrollView>
));
Conversation.displayName = "Conversation";

export const ConversationContent = memo<{
  children: React.ReactNode;
  className?: string;
}>(({ children, className }) => (
  <View className={cn("gap-6 p-4", className)}>{children}</View>
));
ConversationContent.displayName = "ConversationContent";

export const ConversationScrollButton = memo<{ className?: string }>(
  ({ className }) => (
    <TouchableOpacity
      className={cn(
        "absolute bottom-4 right-4 rounded-full bg-blue-500 p-3 shadow-lg",
        className
      )}
    >
      <Ionicons name="arrow-down" size={24} color="white" />
    </TouchableOpacity>
  )
);
ConversationScrollButton.displayName = "ConversationScrollButton";

/* ---------- MESSAGE COMPONENTS ---------- */
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
        <Text className="text-sm font-medium text-gray-600">
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
    )}
  </View>
));
MessageAvatar.displayName = "MessageAvatar";

/* ---------- MESSAGE ACTIONS ---------- */
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

/* ---------- RESPONSE ---------- */
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

/* ---------- REASONING COMPONENTS ---------- */
export const Reasoning = memo<{
  children: React.ReactNode;
  duration?: number;
  className?: string;
}>(({ children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const value = useMemo(() => ({ isOpen, setIsOpen }), [isOpen]);

  return (
    <ReasoningContext.Provider value={value}>
      <View className={cn("mb-2", className)}>{children}</View>
    </ReasoningContext.Provider>
  );
});
Reasoning.displayName = "Reasoning";

export const ReasoningTrigger = memo<{ className?: string }>(
  ({ className }) => {
    const { isOpen, setIsOpen } = useReasoningCtx();

    const handlePress = useCallback(() => {
      setIsOpen(!isOpen);
    }, [isOpen, setIsOpen]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        className={cn(
          "flex-row items-center gap-2 rounded-lg bg-blue-50 px-3 py-2",
          className
        )}
      >
        <FontAwesome5 name="brain" size={24} color="#3B82F6" />
        <Text className="text-sm text-blue-600">Show reasoning</Text>
      </TouchableOpacity>
    );
  }
);
ReasoningTrigger.displayName = "ReasoningTrigger";

export const ReasoningContent = memo<{
  children: string;
  className?: string;
}>(({ children, className }) => {
  const { isOpen } = useReasoningCtx();

  if (!isOpen) return null;

  return (
    <View className={cn("mt-2 rounded-lg bg-blue-50 p-3", className)}>
      <Text className="text-sm text-blue-900">{children}</Text>
    </View>
  );
});
ReasoningContent.displayName = "ReasoningContent";

/* ---------- SOURCES COMPONENTS ---------- */
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

/* ---------- SUGGESTION COMPONENTS ---------- */
export const Suggestions = memo<{
  children: React.ReactNode;
  className?: string;
}>(({ children, className }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
    className={cn("bg-background", className)}
  >
    {children}
  </ScrollView>
));
Suggestions.displayName = "Suggestions";

export const Suggestion = memo<{
  suggestion: string;
  onClick: () => void;
  className?: string;
}>(({ suggestion, onClick, className }) => (
  <TouchableOpacity
    onPress={onClick}
    className={cn(
      "rounded-lg border border-gray-300 bg-white px-3 py-2 self-start",
      className
    )}
    style={{ minHeight: 36 }}
  >
    <Text className="text-sm text-gray-700" numberOfLines={1}>
      {suggestion}
    </Text>
  </TouchableOpacity>
));
Suggestion.displayName = "Suggestion";

/* ---------- PROMPT INPUT COMPONENTS ---------- */
export const PromptInput = memo<{
  children: React.ReactNode;
  onSubmit: (msg: PromptInputMessage) => void;
  multiple?: boolean;
  globalDrop?: boolean;
  className?: string;
}>(
  ({ children, onSubmit, multiple = false, globalDrop = false, className }) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const addAttachment = useCallback((a: Attachment) => {
      setAttachments((prev) => [...prev, a]);
    }, []);

    const removeAttachment = useCallback((id: string) => {
      setAttachments((prev) => prev.filter((x) => x.id !== id));
    }, []);

    // Enhanced onSubmit that includes attachments
    const handleSubmit = useCallback(
      (msg: PromptInputMessage) => {
        // Pass both text and current attachments
        onSubmit({
          text: msg.text,
          files: attachments,
        });
        // Clear attachments after sending
        setAttachments([]);
      },
      [onSubmit, attachments]
    );

    const value = useMemo(
      () => ({
        onSubmit: handleSubmit,
        multiple,
        globalDrop,
        attachments,
        addAttachment,
        removeAttachment,
      }),
      [
        handleSubmit,
        multiple,
        globalDrop,
        attachments,
        addAttachment,
        removeAttachment,
      ]
    );

    return (
      <PromptInputContext.Provider value={value}>
        <View
          className={cn(
            "rounded-t-3xl border border-b-0 border-gray-200 dark:border-stone-700 bg-background",
            className
          )}
        >
          <View className="px-4 py-3 gap-3 flex-row items-end">{children}</View>
        </View>
      </PromptInputContext.Provider>
    );
  }
);
PromptInput.displayName = "PromptInput";

export const PromptInputBody = memo<{ children: React.ReactNode }>(
  ({ children }) => (
    <View className="flex-1 flex-row bg-gray-200 dark:bg-neutral-800 rounded-3xl pl-3 pr-2 py-2">
      {children}
    </View>
  )
);
PromptInputBody.displayName = "PromptInputBody";

export const PromptInputTextarea = memo(
  forwardRef<TextInput, TextInputProps>(({ className, ...props }, ref) => (
    <TextInput
      ref={ref}
      multiline
      placeholder="Type your message..."
      placeholderTextColor="#9CA3AF"
      className={cn(
        "max-h-[120px] text-base dark:bg-neutral-800 dark:text-white py-2 px-2 flex-1",
        className
      )}
      {...props}
    />
  ))
);
PromptInputTextarea.displayName = "PromptInputTextarea";

export const PromptInputSubmit = memo<{
  status: "submitted" | "streaming" | "ready" | "error";
  disabled?: boolean;
  value?: string;
  className?: string;
}>(({ status, disabled, value, className }) => {
  const { colorScheme } = useColorScheme();
  const { onSubmit } = usePromptInput();

  const isDisabled = disabled || !value?.trim() || status !== "ready";

  const handlePress = useCallback(() => {
    if (!isDisabled && value) {
      onSubmit({ text: value });
    }
  }, [isDisabled, value, onSubmit]);

  const buttonColor = useMemo(() => {
    if (colorScheme === "light") {
      return isDisabled ? "bg-neutral-300" : "bg-neutral-700";
    }
    return isDisabled ? "bg-neutral-800" : "bg-neutral-700";
  }, [colorScheme, isDisabled]);

  const iconColor = useMemo(() => {
    if (isDisabled) {
      return colorScheme === "light" ? "#a3a3a3" : "#525252";
    }
    return "#fff";
  }, [colorScheme, isDisabled]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      className={cn(
        "rounded-full p-2 justify-center items-center self-end",
        buttonColor,
        className
      )}
    >
      {status === "streaming" || status === "submitted" ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Feather name="arrow-up" size={24} color={iconColor} />
      )}
    </TouchableOpacity>
  );
});
PromptInputSubmit.displayName = "PromptInputSubmit";

/* ---------- ATTACHMENTS ---------- */
export const PromptInputAttachments = memo<{ className?: string }>(
  ({ className }) => {
    const { attachments, removeAttachment } = usePromptInput();

    if (attachments.length === 0) return null;

    return (
      <View className={cn("flex-row flex-wrap gap-2 mb-2", className)}>
        {attachments.map((attachment) => (
          <ImageBasic
            key={attachment.id}
            uri={attachment.uri}
            alt={attachment.name}
            size="sm"
            onRemove={() => removeAttachment(attachment.id)}
          />
        ))}
      </View>
    );
  }
);
PromptInputAttachments.displayName = "PromptInputAttachments";

export const PromptInputAttachment = memo<{
  data: Attachment;
  className?: string;
}>(({ data, className }) => {
  const { removeAttachment } = usePromptInput();

  const formattedSize = useMemo(() => {
    if (data.size === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(data.size) / Math.log(k));
    return `${parseFloat((data.size / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }, [data.size]);

  const handleRemove = useCallback(() => {
    removeAttachment(data.id);
  }, [data.id, removeAttachment]);

  return (
    <View
      className={cn(
        "flex-row items-center gap-2 rounded-lg bg-gray-100 dark:bg-neutral-800 px-3 py-2",
        className
      )}
    >
      <Text
        className="flex-1 text-sm text-gray-700 dark:text-gray-200"
        numberOfLines={1}
      >
        {data.name}
      </Text>
      <Text className="text-xs text-gray-500">{formattedSize}</Text>
      <TouchableOpacity onPress={handleRemove} className="p-1 rounded-full">
        <Text className="text-gray-500">✕</Text>
      </TouchableOpacity>
    </View>
  );
});
PromptInputAttachment.displayName = "PromptInputAttachment";

export const PromptInputAttachmentButton = memo<{ className?: string }>(
  ({ className }) => {
    const { colorScheme } = useColorScheme();
    const { addAttachment } = usePromptInput();

    const handlePhotos = useCallback(async () => {
      try {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please grant photo library access to select images."
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
          result.assets.forEach((asset, index) => {
            const attachment: Attachment = {
              id: `${Date.now()}-${index}`,
              name: asset.fileName || `image-${Date.now()}-${index}.jpg`,
              size: asset.fileSize || 0,
              type: asset.mimeType || "image/jpeg",
              uri: asset.uri,
            };
            addAttachment(attachment);
          });
        }
      } catch (error) {
        console.error("Error picking image:", error);
        Alert.alert("Error", "Failed to select image");
      }
    }, [addAttachment]);

    const handleCamera = useCallback(async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please grant camera access to take photos."
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          const attachment: Attachment = {
            id: Date.now().toString(),
            name: asset.fileName || `photo-${Date.now()}.jpg`,
            size: asset.fileSize || 0,
            type: asset.mimeType || "image/jpeg",
            uri: asset.uri,
          };
          addAttachment(attachment);
        }
      } catch (error) {
        console.error("Error taking photo:", error);
        Alert.alert("Error", "Failed to take photo");
      }
    }, [addAttachment]);

    const handleDocuments = useCallback(async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: "*/*",
          copyToCacheDirectory: true,
          multiple: true,
        });

        if (!result.canceled && result.assets.length > 0) {
          result.assets.forEach((doc, index) => {
            const attachment: Attachment = {
              id: `${Date.now()}-${index}`,
              name: doc.name,
              size: doc.size || 0,
              type: doc.mimeType || "application/octet-stream",
              uri: doc.uri,
            };
            addAttachment(attachment);
          });
        }
      } catch (error) {
        console.error("Error picking document:", error);
        Alert.alert("Error", "Failed to select document");
      }
    }, [addAttachment]);

    const iconColor = colorScheme === "light" ? "#374151" : "#fff";

    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <TouchableOpacity
            className={cn(
              "rounded-full p-2 bg-gray-100 mb-2 dark:bg-neutral-800",
              className
            )}
          >
            <Ionicons name="add" size={24} color={iconColor} />
          </TouchableOpacity>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.Item key="photos" onSelect={handlePhotos}>
            <DropdownMenu.ItemTitle>Photos</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{ name: "photo.on.rectangle", pointSize: 18 }}
              androidIconName="photo_library"
            />
          </DropdownMenu.Item>

          <DropdownMenu.Item key="camera" onSelect={handleCamera}>
            <DropdownMenu.ItemTitle>Camera</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{ name: "camera", pointSize: 18 }}
              androidIconName="camera_alt"
            />
          </DropdownMenu.Item>

          <DropdownMenu.Item key="documents" onSelect={handleDocuments}>
            <DropdownMenu.ItemTitle>Documents</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{ name: "doc.text", pointSize: 18 }}
              androidIconName="description"
            />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
  }
);
PromptInputAttachmentButton.displayName = "PromptInputAttachmentButton";

export const ImageBasic = memo<{
  base64?: string;
  uri?: string;
  mediaType?: string;
  alt?: string;
  size?: "sm" | "lg";
  onRemove?: () => void;
  className?: string;
}>(
  ({
    base64,
    uri,
    mediaType = "image/jpeg",
    alt,
    size = "sm",
    onRemove,
    className,
  }) => {
    const sizeClasses = size === "sm" ? "h-20 w-20" : "h-36 w-36";
    const borderClasses =
      size === "sm"
        ? "rounded-md border border-gray-200 dark:border-neutral-700"
        : "rounded-xl";

    const imageSrc = useMemo(() => {
      return uri || (base64 ? `data:${mediaType};base64,${base64}` : undefined);
    }, [uri, base64, mediaType]);

    return (
      <View className={cn("relative", className)}>
        {imageSrc ? (
          <Image
            source={{ uri: imageSrc }}
            className={cn(sizeClasses, borderClasses)}
            accessibilityLabel={alt}
          />
        ) : (
          <View
            className={cn(
              sizeClasses,
              "items-center justify-center bg-gray-100 dark:bg-neutral-800",
              borderClasses
            )}
          >
            <Text className="text-gray-400 text-xs">No Image</Text>
          </View>
        )}

        {onRemove && (
          <TouchableOpacity
            onPress={onRemove}
            className="absolute -top-2 -right-2 bg-black/70 rounded-full p-1"
          >
            <AntDesign name="close" size={12} color="white" />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);
ImageBasic.displayName = "ImageBasic";

export const MessageAttachment = memo<{
  data: Attachment;
  className?: string;
}>(({ data, className }) => {
  const formattedSize = useMemo(() => {
    if (data.size === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(data.size) / Math.log(k));
    return `${parseFloat((data.size / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }, [data.size]);

  return (
    <View
      className={cn(
        "flex-row items-center gap-2 rounded-lg bg-gray-100 dark:bg-neutral-800 px-3 py-2 w-full",
        className
      )}
    >
      <View className="h-8 w-8 items-center justify-center rounded bg-white dark:bg-neutral-700">
        <Ionicons name="document-text-outline" size={16} color="#6B7280" />
      </View>
      <View className="flex-1">
        <Text
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
          numberOfLines={1}
        >
          {data.name}
        </Text>
        <Text className="text-xs text-gray-500">{formattedSize}</Text>
      </View>
    </View>
  );
});
MessageAttachment.displayName = "MessageAttachment";

export const MessageAttachments = memo<{
  attachments: Attachment[];
  className?: string;
}>(({ attachments, className }) => {
  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter((a) => a.type.startsWith("image/"));
  const files = attachments.filter((a) => !a.type.startsWith("image/"));

  return (
    <View className={cn("gap-2 mb-2", className)}>
      {/* Images Grid */}
      {images.length > 0 && (
        <View
          className={cn(
            "flex-row flex-wrap gap-2",
            className?.includes("items-end") && "justify-end"
          )}
        >
          {images.map((image) => (
            <ImageBasic
              key={image.id}
              uri={image.uri}
              alt={image.name}
              size="sm"
              className="rounded-lg overflow-hidden"
            />
          ))}
        </View>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <View className="gap-2">
          {files.map((file) => (
            <MessageAttachment key={file.id} data={file} />
          ))}
        </View>
      )}
    </View>
  );
});
MessageAttachments.displayName = "MessageAttachments";

/* ---------- CARD STACK COMPONENTS ---------- */
const SCREEN_WIDTH = Dimensions.get("window").width;
const PER_ITEM_ROTATION = (2 * Math.PI) / 180;
const PER_ITEM_SCALE = 0.9;
const HORIZONTAL_OFFSETS = [20, 14.5, 10, 9, 5] as const;

interface CardStackProps {
  data: Array<{ id: string | number; [key: string]: any }>;
  initialIndex?: number;
  cardDimensions: { width: number; height: number };
  renderItem: (item: any, index: number) => React.ReactNode;
  pageWidthFactor?: number;
}

interface CardProps {
  item: any;
  index: number;
  totalItems: number;
  scrollX: any;
  focusedIndex: any;
  cardDimensions: { width: number; height: number };
  renderItem: (item: any, index: number) => React.ReactNode;
  pageWidth: number;
}

function horizontalOffsetForProgress(offset: number): number {
  "worklet";
  const index = Math.floor(offset);
  const progress = offset - index;

  let value = 0;
  const limit = Math.min(HORIZONTAL_OFFSETS.length, Math.max(0, index));

  for (let i = 0; i < limit; i++) {
    value += HORIZONTAL_OFFSETS[i];
  }

  if (index >= 0 && index < HORIZONTAL_OFFSETS.length) {
    value += HORIZONTAL_OFFSETS[index] * progress;
  }

  return value;
}

function itemTransformForItem(
  index: number,
  progress: number,
  isLeading: boolean
): { horizontalOffset: number; rotation: number; scale: number } {
  "worklet";
  const multiplier = isLeading ? -1 : 1;
  const pageProgress = index - progress * multiplier;
  const horizontalOffset =
    horizontalOffsetForProgress(pageProgress) * multiplier;
  const rotation = PER_ITEM_ROTATION * pageProgress * multiplier;
  const scale = Math.pow(PER_ITEM_SCALE, pageProgress);

  return { horizontalOffset, rotation, scale: scale - 1 };
}

function easeInOut(t: number): number {
  "worklet";
  return t * t * (3 - 2 * t);
}

const AnimatedCard = memo<CardProps>(
  ({
    item,
    index,
    totalItems,
    scrollX,
    focusedIndex,
    cardDimensions,
    renderItem,
    pageWidth,
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const offset = scrollX.value;
      const currentFocusedIndex = focusedIndex.value;
      const pageProgress = offset / pageWidth;

      const progressFromFocusedItem = pageProgress - currentFocusedIndex;
      const isMovingToLeadingStack = progressFromFocusedItem > 0;
      const isMovingToTrailingStack = progressFromFocusedItem < 0;

      const canGoForward = currentFocusedIndex < totalItems - 1;
      const canGoBackwards = currentFocusedIndex > 0;
      const shouldRubberBand =
        (!canGoForward && isMovingToLeadingStack) ||
        (!canGoBackwards && isMovingToTrailingStack);

      const relativeIndex = Math.abs(index - currentFocusedIndex);
      const isPartOfLeadingStack = index < currentFocusedIndex;

      let transform: Array<
        { translateX: number } | { rotate: string } | { scale: number }
      > = [];
      let zIndex = 0;
      let opacity = 1;

      // Current focused item with animation
      if (index === currentFocusedIndex && !shouldRubberBand) {
        const progress = Math.abs(progressFromFocusedItem);

        if (progress < 1) {
          zIndex = 100;
          const final = itemTransformForItem(1, 0, isMovingToLeadingStack);
          const t = easeInOut(progress);

          transform = [
            { translateX: final.horizontalOffset * t },
            { rotate: `${final.rotation * t}rad` },
            { scale: 1 + final.scale * t },
          ];
        } else {
          zIndex = -3;
          const final = itemTransformForItem(1, 0, isMovingToLeadingStack);
          transform = [
            { translateX: final.horizontalOffset },
            { rotate: `${final.rotation}rad` },
            { scale: 1 + final.scale },
          ];
        }
      }
      // Next item coming into focus
      else if (
        (isMovingToLeadingStack && index === currentFocusedIndex + 1) ||
        (isMovingToTrailingStack && index === currentFocusedIndex - 1)
      ) {
        const progress = Math.abs(progressFromFocusedItem);

        if (progress < 1) {
          zIndex = 50;
          const initial = itemTransformForItem(1, 0, !isMovingToLeadingStack);
          const t = easeInOut(progress);

          transform = [
            { translateX: initial.horizontalOffset * (1 - t) },
            { rotate: `${initial.rotation * (1 - t)}rad` },
            { scale: 1 + initial.scale * (1 - t) },
          ];
        } else {
          zIndex = 100;
          transform = [{ translateX: 0 }, { rotate: "0rad" }, { scale: 1 }];
        }
      }
      // Items in the stack
      else if (relativeIndex <= HORIZONTAL_OFFSETS.length) {
        if (isMovingToLeadingStack !== isPartOfLeadingStack) {
          zIndex = -2 * relativeIndex;
        } else {
          zIndex = -HORIZONTAL_OFFSETS.length - 2 * relativeIndex;
        }

        const itemTransform = itemTransformForItem(
          relativeIndex,
          progressFromFocusedItem,
          isPartOfLeadingStack
        );

        transform = [
          { translateX: itemTransform.horizontalOffset },
          { rotate: `${itemTransform.rotation}rad` },
          { scale: 1 + itemTransform.scale },
        ];

        // Alpha animation for last item in stack
        if (relativeIndex === HORIZONTAL_OFFSETS.length) {
          opacity = Math.abs(progressFromFocusedItem);
        } else if (
          isPartOfLeadingStack &&
          progressFromFocusedItem > 0 &&
          relativeIndex === HORIZONTAL_OFFSETS.length - 1
        ) {
          opacity = 1 - Math.abs(progressFromFocusedItem);
        } else if (
          !isPartOfLeadingStack &&
          progressFromFocusedItem < 0 &&
          relativeIndex === HORIZONTAL_OFFSETS.length - 1
        ) {
          opacity = 1 + progressFromFocusedItem;
        }
      }
      // Items beyond visible range
      else {
        opacity = 0;
        transform = [{ scale: 0 }];
        zIndex = -999;
      }

      return {
        transform,
        zIndex,
        opacity,
      };
    });

    return (
      <Animated.View
        style={[
          styles.card,
          {
            width: cardDimensions.width,
            height: cardDimensions.height,
          },
          animatedStyle,
        ]}
      >
        {renderItem(item, index)}
      </Animated.View>
    );
  }
);
AnimatedCard.displayName = "AnimatedCard";

export const CardStack = memo<CardStackProps>(
  ({
    data,
    initialIndex = 0,
    cardDimensions,
    renderItem,
    pageWidthFactor = 0.5,
  }) => {
    const PAGE_WIDTH = useMemo(
      () => SCREEN_WIDTH * pageWidthFactor,
      [pageWidthFactor]
    );

    const scrollX = useSharedValue(initialIndex * PAGE_WIDTH);
    const focusedIndex = useSharedValue(initialIndex);
    const startX = useSharedValue(0);

    const panGesture = useMemo(
      () =>
        Gesture.Pan()
          .onStart(() => {
            startX.value = scrollX.value;
          })
          .onUpdate((event) => {
            const newScroll = startX.value - event.translationX;
            const maxScroll = (data.length - 1) * PAGE_WIDTH;

            // Apply rubber banding at boundaries
            if (newScroll < 0) {
              scrollX.value = newScroll * 0.3;
            } else if (newScroll > maxScroll) {
              scrollX.value = maxScroll + (newScroll - maxScroll) * 0.3;
            } else {
              scrollX.value = newScroll;
            }
          })
          .onEnd((event) => {
            const velocity = -event.velocityX;
            const swipeThreshold = PAGE_WIDTH * 0.3;
            const displacement = scrollX.value - startX.value;

            let targetPage = focusedIndex.value;

            // Determine direction based on velocity or displacement
            if (Math.abs(velocity) > 400) {
              targetPage =
                velocity > 0 ? focusedIndex.value + 1 : focusedIndex.value - 1;
            } else if (Math.abs(displacement) > swipeThreshold) {
              targetPage =
                displacement > 0
                  ? focusedIndex.value + 1
                  : focusedIndex.value - 1;
            }

            // Clamp to valid range
            targetPage = Math.max(0, Math.min(data.length - 1, targetPage));

            // Update focused index
            focusedIndex.value = targetPage;

            // Animate to target page
            scrollX.value = withSpring(targetPage * PAGE_WIDTH, {
              damping: 20,
              stiffness: 90,
            });
          }),
      [data.length, PAGE_WIDTH, scrollX, focusedIndex, startX]
    );

    return (
      <GestureDetector gesture={panGesture}>
        <View style={styles.cardsContainer}>
          {data.map((item, index) => (
            <AnimatedCard
              key={item.id ?? index}
              item={item}
              index={index}
              totalItems={data.length}
              scrollX={scrollX}
              focusedIndex={focusedIndex}
              cardDimensions={cardDimensions}
              renderItem={renderItem}
              pageWidth={PAGE_WIDTH}
            />
          ))}
        </View>
      </GestureDetector>
    );
  }
);
CardStack.displayName = "CardStack";

const styles = StyleSheet.create({
  cardsContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  card: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
});
