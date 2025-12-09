import { createContext, useContext } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { Attachment, MessageRole } from './types';

export interface BranchContextType {
  currentBranch: number;
  setCurrentBranch: (index: number) => void;
  totalBranches: number;
}

export interface MessageContextType {
  from: MessageRole;
}

export interface ReasoningContextType {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

export interface SourceContextType {
  href?: string;
}

export interface PromptInputContextType {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  attachments: Attachment[];
  addAttachment: (a: Attachment) => void;
  removeAttachment: (id: string) => void;
  inputHeight: number;
  onLayoutChange: (e: LayoutChangeEvent) => void;
  submit: () => void;
}

export const BranchContext = createContext<BranchContextType | undefined>(undefined);
export const MessageContext = createContext<MessageContextType | undefined>(undefined);
export const ReasoningContext = createContext<ReasoningContextType | undefined>(undefined);
export const SourceContext = createContext<SourceContextType | undefined>(undefined);
export const PromptInputContext = createContext<PromptInputContextType | undefined>(undefined);

export const useBranch = (): BranchContextType => {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranch must be used inside <Branch>");
  return ctx;
};

export const useMessage = (): MessageContextType => {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessage must be used inside <Message>");
  return ctx;
};

export const useReasoningCtx = (): ReasoningContextType => {
  const ctx = useContext(ReasoningContext);
  if (!ctx) throw new Error("useReasoningCtx must be used inside <Reasoning>");
  return ctx;
};

export const useSource = (): SourceContextType => {
  const ctx = useContext(SourceContext);
  if (!ctx) throw new Error("useSource must be used inside <Source>");
  return ctx;
};

export const usePromptInput = (): PromptInputContextType => {
  const ctx = useContext(PromptInputContext);
  if (!ctx) throw new Error("usePromptInput must be used inside <PromptInput>");
  return ctx;
};
