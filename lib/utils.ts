import { clsx, type ClassValue } from "clsx";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { twMerge } from "tailwind-merge";

export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

  // In production or when API base URL is defined, use it
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
  }

  // In development, try to construct from experienceUrl
  if (process.env.NODE_ENV === "development" && Constants.experienceUrl) {
    const origin = Constants.experienceUrl.replace("exp://", "http://");
    return origin.concat(path);
  }

  // Fallback for development when experienceUrl is not available
  if (process.env.NODE_ENV === "development") {
    // Use localhost with common Expo dev server port
    const localhost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
    return `http://${localhost}:8081${path}`;
  }

  // If we get here, configuration is missing
  throw new Error(
    "API URL could not be determined. Please set EXPO_PUBLIC_API_BASE_URL environment variable."
  );
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * File Conversion Utilities
 * Converts files to data URLs and handles MIME type normalization
 */

// import { Attachment } from "@/components/ai-elements";

/**
 * File Conversion Utilities
 * Converts files to data URLs and handles MIME type normalization
 */

export interface FilePart {
  type: "file";
  mediaType: string;
  url: string;
  name?: string;
}

export interface TextPart {
  type: "text";
  text: string;
}

export type MessagePart = TextPart | FilePart;

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
}

/**
 * Converts a file URI to a data URL (base64)
 * For React Native, we need to read the file from the URI
 */
async function fileURIToDataURL(
  uri: string,
  mimeType: string
): Promise<string> {
  try {
    // For React Native, we'll use fetch to read the file as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to data URL"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting file to data URL:", error);
    throw error;
  }
}

/**
 * Normalizes DOC/DOCX MIME types to common identifiers
 */
function normalizeDocMime(mime: string): string {
  switch (mime) {
    case "application/msword":
    case "application/vnd.ms-word":
      return "application/msword";

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/vnd.ms-word.document.macroEnabled.12":
    case "application/x-docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    default:
      return mime;
  }
}

/**
 * Gets MIME type from file extension as fallback
 */
function getMimeTypeFromExtension(filename: string): string {
  const name = filename.toLowerCase();

  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".txt")) return "text/plain";
  if (name.endsWith(".doc")) return "application/msword";
  if (name.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  // Image extensions
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".bmp")) return "image/bmp";
  if (name.endsWith(".webp")) return "image/webp";

  return "application/octet-stream";
}

/**
 * Validates file size (default 10MB limit)
 */
function validateFileSize(size: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}

/**
 * Converts attachments to file parts for sending to AI
 */
export async function convertAttachmentsToFileParts(
  attachments: Attachment[]
): Promise<FilePart[]> {
  const parts = await Promise.all(
    attachments.map(async (attachment) => {
      // Validate file size (10MB limit)
      if (!validateFileSize(attachment.size)) {
        throw new Error(`File "${attachment.name}" exceeds 10MB size limit`);
      }

      let mediaType = attachment.type;

      // Fallback to extension-based MIME type detection
      if (
        !mediaType ||
        mediaType === "" ||
        mediaType === "application/octet-stream"
      ) {
        mediaType = getMimeTypeFromExtension(attachment.name);
      }

      // Normalize DOC/DOCX MIME types
      if (mediaType.includes("word")) {
        mediaType = normalizeDocMime(mediaType);
      }

      // Convert file URI to data URL
      const dataUrl = await fileURIToDataURL(attachment.uri, mediaType);

      return {
        type: "file" as const,
        mediaType,
        url: dataUrl,
        name: attachment.name,
      };
    })
  );

  return parts;
}

/**
 * Processes file parts with type-specific handling
 */
export function processFileParts(fileParts: FilePart[]): FilePart[] {
  return fileParts.map((part) => {
    switch (true) {
      case part.mediaType.startsWith("image/"):
        // Could add image compression or validation here
        console.log("Processing image file:", part.mediaType);
        return part;

      case part.mediaType === "application/pdf":
        // Could enforce size/page limits here
        console.log("Processing PDF file");
        return part;

      case part.mediaType === "text/plain":
        // Could add sanitization here
        console.log("Processing text file");
        return part;

      case part.mediaType === "application/msword":
      case part.mediaType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        // Could add document-specific validation here
        console.log("Processing Word document");
        return part;

      default:
        console.log("Processing generic file:", part.mediaType);
        return part;
    }
  });
}

/**
 * Builds message parts from text and attachments
 */
export async function buildMessageParts(
  text: string,
  attachments: Attachment[]
): Promise<MessagePart[]> {
  const parts: MessagePart[] = [];

  // Add text part if present
  const trimmedText = text.trim();
  if (trimmedText.length > 0) {
    parts.push({
      type: "text",
      text: trimmedText,
    });
  }

  // Add file parts if present
  if (attachments.length > 0) {
    try {
      const fileParts = await convertAttachmentsToFileParts(attachments);
      const processedParts = processFileParts(fileParts);
      parts.push(...processedParts);
    } catch (error) {
      console.error("Error converting attachments:", error);
      throw error;
    }
  }

  return parts;
}
