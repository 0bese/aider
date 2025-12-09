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

export type MessageRole = "user" | "assistant" | "system";
