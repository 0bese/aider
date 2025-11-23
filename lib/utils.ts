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
