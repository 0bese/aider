import { cn } from "@/lib/utils";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { memo, useCallback, useMemo } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import * as DropdownMenu from "zeego/dropdown-menu";
import { usePromptInput } from "./contexts";
import { Attachment } from "./types";

// Helper ImageBasic
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
          <DropdownMenu.Item
            key="models"
            onSelect={() => {
              router.navigate("/(modal)/models");
            }}
          >
            <DropdownMenu.ItemTitle>Models</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{ name: "wand.and.stars", pointSize: 18 }}
            />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
  }
);
PromptInputAttachmentButton.displayName = "PromptInputAttachmentButton";

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

export const PromptInputBody = memo<{ children: React.ReactNode }>(
  ({ children }) => (
    <View className="flex-1 flex-row bg-gray-200 dark:bg-neutral-800 rounded-3xl pl-3 pr-2 py-2">
      {children}
    </View>
  )
);
PromptInputBody.displayName = "PromptInputBody";

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
