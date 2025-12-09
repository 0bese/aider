import { COPY_FEEDBACK_DURATION } from "@/lib/chat-utils";
import * as Clipboard from "expo-clipboard";
import { createContext, useCallback, useContext, useState } from "react";

interface CopyContextType {
  copiedMessageId: string | null;
  handleCopyMessage: (text: string, messageId: string) => Promise<void>;
}

const CopyContext = createContext<CopyContextType | undefined>(undefined);

export const CopyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopyMessage = useCallback(
    async (text: string, messageId: string) => {
      try {
        await Clipboard.setStringAsync(text);
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), COPY_FEEDBACK_DURATION);
      } catch (error) {
        console.error("Failed to copy message:", error);
      }
    },
    []
  );

  return (
    <CopyContext.Provider value={{ copiedMessageId, handleCopyMessage }}>
      {children}
    </CopyContext.Provider>
  );
};

export const useCopyContext = () => {
  const context = useContext(CopyContext);
  if (!context)
    throw new Error("useCopyContext must be used within CopyProvider");
  return context;
};
