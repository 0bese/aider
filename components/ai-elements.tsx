/**
 * AI Chat Components - Single File Implementation
 * NativeWind + Expo compatible TypeScript components
 */

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { AntDesign, Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useColorScheme } from "nativewind";
import React, { createContext, forwardRef, useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import * as DropdownMenu from "zeego/dropdown-menu";

/* ---------- TYPES ---------- */
export interface PromptInputMessage {
  text?: string;
  files?: File[];
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
}

/* ---------- BRANCH COMPONENTS ---------- */
interface BranchContextType {
  currentBranch: number;
  setCurrentBranch: (index: number) => void;
  totalBranches: number;
}
const BranchContext = createContext<BranchContextType | undefined>(undefined);
const useBranch = () => {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranch must be used inside <Branch>");
  return ctx;
};

export const Branch = ({
  children,
  defaultBranch = 0,
  className,
}: {
  children: React.ReactNode;
  defaultBranch?: number;
  className?: string;
}) => {
  const [currentBranch, setCurrentBranch] = useState(defaultBranch);
  const totalBranches = React.Children.count(
    React.Children.toArray(children).filter(
      (child) => React.isValidElement(child) && child.type === BranchMessages
    )
  );
  return (
    <BranchContext.Provider
      value={{ currentBranch, setCurrentBranch, totalBranches }}
    >
      <View className={cn("relative", className)}>{children}</View>
    </BranchContext.Provider>
  );
};

export const BranchMessages = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { currentBranch } = useBranch();
  const kids = React.Children.toArray(children);
  return (
    <View className={cn("relative", className)}>{kids[currentBranch]}</View>
  );
};

export const BranchSelector = ({
  children,
  from,
  className,
}: {
  children: React.ReactNode;
  from: "user" | "assistant";
  className?: string;
}) => (
  <View
    className={cn(
      "flex-row items-center justify-center gap-2 px-4 py-2",
      from === "user" ? "bg-blue-50" : "bg-gray-50",
      className
    )}
  >
    {children}
  </View>
);

export const BranchPrevious = ({ className }: { className?: string }) => {
  const { currentBranch, setCurrentBranch } = useBranch();
  return (
    <TouchableOpacity
      onPress={() => setCurrentBranch(Math.max(0, currentBranch - 1))}
      disabled={currentBranch === 0}
      className={cn(
        "p-2 rounded-full",
        currentBranch === 0 ? "opacity-50" : "bg-gray-200",
        className
      )}
    >
      <Ionicons name="chevron-back" size={24} color="black" />
    </TouchableOpacity>
  );
};

export const BranchNext = ({ className }: { className?: string }) => {
  const { currentBranch, totalBranches, setCurrentBranch } = useBranch();
  return (
    <TouchableOpacity
      onPress={() =>
        setCurrentBranch(Math.min(totalBranches - 1, currentBranch + 1))
      }
      disabled={currentBranch === totalBranches - 1}
      className={cn(
        "p-2 rounded-full",
        currentBranch === totalBranches - 1 ? "opacity-50" : "bg-gray-200",
        className
      )}
    >
      <Ionicons name="chevron-forward" size={24} color="black" />
    </TouchableOpacity>
  );
};

export const BranchPage = ({ className }: { className?: string }) => {
  const { currentBranch, totalBranches } = useBranch();
  return (
    <Text className={cn("text-sm text-gray-600", className)}>
      {currentBranch + 1} / {totalBranches}
    </Text>
  );
};

/* ---------- CONVERSATION COMPONENTS ---------- */
export const Conversation = ({
  children,
  className,
  scrollRef,
}: {
  children: React.ReactNode;
  className?: string;
  scrollRef?: React.RefObject<ScrollView | null>;
}) => (
  <ScrollView
    ref={scrollRef}
    className={cn("flex-1 bg-background", className)}
    showsVerticalScrollIndicator={false}
    automaticallyAdjustContentInsets
  >
    {children}
  </ScrollView>
);

export const ConversationContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <View className={cn("gap-6 p-4", className)}>{children}</View>;

export const ConversationScrollButton = ({
  className,
}: {
  className?: string;
}) => (
  <TouchableOpacity
    className={cn(
      "absolute bottom-4 right-4 rounded-full bg-blue-500 p-3 shadow-lg",
      className
    )}
  >
    <Ionicons name="arrow-down" size={24} color="white" />
  </TouchableOpacity>
);

/* ---------- MESSAGE COMPONENTS ---------- */
interface MessageContextType {
  from: "user" | "assistant" | "system";
}
const MessageContext = createContext<MessageContextType | undefined>(undefined);
const useMessage = () => {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessage must be used inside <Message>");
  return ctx;
};

export const Message = ({
  children,
  from,
  className,
}: {
  children: React.ReactNode;
  from: "user" | "assistant" | "system";
  className?: string;
}) => (
  <MessageContext.Provider value={{ from }}>
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

export const MessageContent = ({
  children,
  from,
  className,
}: {
  children: React.ReactNode;
  from?: "user" | "assistant" | "system";
  className?: string;
}) => {
  const messageContext = useMessage();
  const messageFrom = from || messageContext.from;

  return (
    <View
      className={cn(
        messageFrom === "user"
          ? " rounded-2xl bg-gray-100 dark:bg-neutral-900 px-5 py-3"
          : "w-full",
        "self-end",
        className
      )}
    >
      {children}
    </View>
  );
};

export const MessageAvatar = ({
  src,
  name,
  className,
}: {
  src: string;
  name: string;
  className?: string;
}) => (
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
);

/* ---------- MESSAGE ACTIONS ---------- */
export const MessageActions = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { from } = useMessage();

  // Only show actions for assistant and system messages
  if (from === "user") return null;

  return (
    <View className={cn("flex-row items-center gap-2 mt-2", className)}>
      {children}
    </View>
  );
};

export const MessageAction = ({
  children,
  onPress,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
} & TouchableOpacityProps) => (
  <TouchableOpacity
    onPress={onPress}
    className={cn(
      "rounded-lg bg-gray-50 dark:bg-neutral-900 p-2 active:bg-gray-200",
      className
    )}
    {...rest}
  >
    {children}
  </TouchableOpacity>
);

/* ---------- RESPONSE ---------- */
export const Response = ({
  children,
  from,
  className,
}: {
  children: string;
  from?: "user" | "assistant" | "system";
  className?: string;
}) => {
  const messageContext = useMessage();
  const messageFrom = from || messageContext.from;

  return (
    <View className={cn("flex-shrink", className)}>
      <Text className={cn()}>{children}</Text>
    </View>
  );
};

/* ---------- REASONING COMPONENTS ---------- */
interface ReasoningCtx {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}
const ReasoningContext = createContext<ReasoningCtx | undefined>(undefined);
const useReasoningCtx = () => {
  const c = useContext(ReasoningContext);
  if (!c) throw new Error("useReasoningCtx inside <Reasoning>");
  return c;
};

export const Reasoning = ({
  children,
  duration,
  className,
}: {
  children: React.ReactNode;
  duration: number;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ReasoningContext.Provider value={{ isOpen, setIsOpen }}>
      <View className={cn("mb-2", className)}>{children}</View>
    </ReasoningContext.Provider>
  );
};

export const ReasoningTrigger = ({ className }: { className?: string }) => {
  const { isOpen, setIsOpen } = useReasoningCtx();
  return (
    <TouchableOpacity
      onPress={() => setIsOpen(!isOpen)}
      className={cn(
        "flex-row items-center gap-2 rounded-lg bg-blue-50 px-3 py-2",
        className
      )}
    >
      <FontAwesome5 name="brain" size={24} color="#3B82F6" />
      <Text className="text-sm text-blue-600">Show reasoning</Text>
    </TouchableOpacity>
  );
};

export const ReasoningContent = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => {
  const { isOpen } = useReasoningCtx();
  if (!isOpen) return null;
  return (
    <View className={cn("mt-2 rounded-lg bg-blue-50 p-3", className)}>
      <Text className="text-sm text-blue-900">{children}</Text>
    </View>
  );
};

/* ---------- SOURCES COMPONENTS ---------- */
interface SourceContextType {
  href?: string;
}
const SourceContext = createContext<SourceContextType | undefined>(undefined);
const useSource = () => {
  const ctx = useContext(SourceContext);
  if (!ctx) throw new Error("useSource must be used inside <Source>");
  return ctx;
};

export const Source = ({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) => {
  const handlePress = async () => {
    if (href) {
      try {
        await Linking.openURL(href);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <SourceContext.Provider value={{ href }}>
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
};

export const SourceTrigger = ({
  showFavicon,
  className,
}: {
  showFavicon?: boolean;
  className?: string;
}) => {
  const { href } = useSource();
  const faviconUrl = href
    ? `https://www.google.com/s2/favicons?sz=64&domain_url=${href}`
    : undefined;

  return (
    <View className={cn("flex-row items-center", className)}>
      {showFavicon && faviconUrl && (
        <Image source={{ uri: faviconUrl }} className="h-5 w-5 rounded" />
      )}
    </View>
  );
};

export const SourceContent = ({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) => {
  return (
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
  );
};

/* ---------- SUGGESTION COMPONENTS ---------- */
export const Suggestions = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
    className={cn("bg-background ", className)}
  >
    {children}
  </ScrollView>
);

export const Suggestion = ({
  suggestion,
  onClick,
  className,
}: {
  suggestion: string;
  onClick: () => void;
  className?: string;
}) => (
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
);

/* ---------- PROMPT INPUT COMPONENTS ---------- */
interface PromptInputCtx {
  onSubmit: (msg: PromptInputMessage) => void;
  multiple: boolean;
  globalDrop: boolean;
  attachments: Attachment[];
  addAttachment: (a: Attachment) => void;
  removeAttachment: (id: string) => void;
}
const PromptInputContext = createContext<PromptInputCtx | undefined>(undefined);
const usePromptInput = () => {
  const c = useContext(PromptInputContext);
  if (!c) throw new Error("usePromptInput inside <PromptInput>");
  return c;
};

export const PromptInput = ({
  children,
  onSubmit,
  multiple = false,
  globalDrop = false,
  className,
}: {
  children: React.ReactNode;
  onSubmit: (msg: PromptInputMessage) => void;
  multiple?: boolean;
  globalDrop?: boolean;
  className?: string;
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const addAttachment = (a: Attachment) => setAttachments((p) => [...p, a]);
  const removeAttachment = (id: string) =>
    setAttachments((p) => p.filter((x) => x.id !== id));

  return (
    <PromptInputContext.Provider
      value={{
        onSubmit,
        multiple,
        globalDrop,
        attachments,
        addAttachment,
        removeAttachment,
      }}
    >
      <View
        className={cn(
          "rounded-t-3xl border border-b-0 border-gray-200 dark:border-stone-700 bg-background",
          className
        )}
      >
        <View className={"px-4 py-3 gap-3 flex-row items-end"}>{children}</View>
      </View>
    </PromptInputContext.Provider>
  );
};

export const PromptInputBody = ({
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <View className="flex-1 flex-row bg-gray-200 dark:bg-neutral-800 rounded-3xl pl-3 pr-2 py-2 ">
      {children}
    </View>
  );
};

export const PromptInputTextarea = forwardRef<TextInput, TextInputProps>(
  ({ className, ...props }, ref) => (
    <TextInput
      ref={ref}
      multiline
      placeholder="Type your message..."
      className={cn(
        "max-h-[120px] text-base dark:bg-neutral-800 dark:text-white placeholder:text-gray-500 py-2 px-2 flex-1",
        className
      )}
      {...props}
    />
  )
);

export const PromptInputSubmit = ({
  status,
  disabled,
  value,
  className,
}: {
  status: "submitted" | "streaming" | "ready" | "error";
  disabled?: boolean;
  value?: string;
  className?: string;
}) => {
  const { colorScheme } = useColorScheme();
  const { onSubmit } = usePromptInput();
  const handlePress = () => {
    if (!disabled && status === "ready" && value) {
      onSubmit({ text: value });
    }
  };

  const isDisabled = disabled || !value?.trim() || status !== "ready";

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      className={cn(
        "rounded-full p-2 justify-center items-center self-end",
        colorScheme === "light"
          ? isDisabled
            ? "bg-neutral-300"
            : "bg-neutral-700"
          : isDisabled
          ? "bg-neutral-800"
          : "bg-neutral-700",
        className
      )}
    >
      {status === "streaming" || status === "submitted" ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Feather
          name="arrow-up"
          size={24}
          color={
            isDisabled
              ? colorScheme === "light"
                ? "#a3a3a3"
                : "#525252"
              : "#fff"
          }
        />
      )}
    </TouchableOpacity>
  );
};

/* Attachments */
// export const PromptInputAttachments = ({
//   children,
//   className,
// }: {
//   children: (a: Attachment) => React.ReactNode;
//   className?: string;
// }) => {
//   const { attachments } = usePromptInput();

//   if (attachments.length === 0) return null;

//   return (
//     <View className={cn("gap-2 mb-2", className)}>
//       {attachments.map((a) => children(a))}
//     </View>
//   );
// };

export const PromptInputAttachments = ({
  className,
}: {
  className?: string;
}) => {
  const { attachments, removeAttachment } = usePromptInput();

  if (attachments.length === 0) return null;

  return (
    <View className={cn("flex-row flex-wrap gap-2 mb-2", className)}>
      {attachments.map((a) => (
        <ImageBasic
          key={a.id}
          uri={a.uri}
          alt={a.name}
          size="sm"
          onRemove={() => removeAttachment(a.id)}
        />
      ))}
    </View>
  );
};

export const PromptInputAttachment = ({
  data,
  className,
}: {
  data: Attachment;
  className?: string;
}) => {
  const { removeAttachment } = usePromptInput();
  const fmt = (b: number) => {
    if (b === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };
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
      <Text className="text-xs text-gray-500">{fmt(data.size)}</Text>
      <TouchableOpacity
        onPress={() => removeAttachment(data.id)}
        className="p-1 rounded-full"
      >
        <Text className="text-gray-500 p-8">✕</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * PromptInputAttachmentButton Component
 * Dropdown menu for adding attachments to chat input
 */
export const PromptInputAttachmentButton: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { colorScheme } = useColorScheme();
  const { addAttachment } = usePromptInput();

  const handlePhotos = async () => {
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
          const attachment = {
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
  };

  const handleCamera = async () => {
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
        const attachment = {
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
  };

  const handleDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled === false && result.assets.length > 0) {
        result.assets.forEach((doc, index) => {
          const attachment = {
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
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <TouchableOpacity
          className={`rounded-full p-2 bg-gray-100 mb-2 dark:bg-neutral-800 ${
            className || ""
          }`}
        >
          <Ionicons
            name="add"
            size={24}
            color={colorScheme === "light" ? "#374151" : "#fff"}
          />
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
};

export const ImageBasic = ({
  base64,
  uri,
  mediaType = "image/jpeg",
  alt,
  size = "sm",
  onRemove,
  className,
}: {
  base64?: string;
  uri?: string;
  mediaType?: string;
  alt?: string;
  size?: "sm" | "lg";
  onRemove?: () => void;
  className?: string;
}) => {
  const sizeClasses = size === "sm" ? "h-20 w-20" : "h-36 w-36";
  const borderClasses =
    size === "sm"
      ? "rounded-md border border-gray-200 dark:border-neutral-700"
      : "rounded-xl";

  const imageSrc =
    uri || (base64 ? `data:${mediaType};base64,${base64}` : undefined);

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
};

////test
import { Dimensions, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;

const PER_ITEM_ROTATION = (2 * Math.PI) / 180;
const PER_ITEM_SCALE = 0.9;
const HORIZONTAL_OFFSETS = [20, 14.5, 10, 9, 5];

interface CardStackProps {
  data: any[];
  initialIndex?: number;
  cardDimensions: { width: number; height: number };
  renderItem: (item: any, index: number) => React.ReactNode;
  pageWidthFactor?: number;
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

const AnimatedCard: React.FC<CardProps> = ({
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

    let transform = [];
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
};

export const CardStack: React.FC<CardStackProps> = ({
  data,
  initialIndex = 0,
  cardDimensions,
  renderItem,
  pageWidthFactor = 0.5,
}) => {
  const PAGE_WIDTH = SCREEN_WIDTH * pageWidthFactor;
  const scrollX = useSharedValue(initialIndex * PAGE_WIDTH);
  const focusedIndex = useSharedValue(initialIndex);
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
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
          displacement > 0 ? focusedIndex.value + 1 : focusedIndex.value - 1;
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
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.cardsContainer}>
        {data.map((item, index) => (
          <AnimatedCard
            key={item.id || index}
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
};

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
