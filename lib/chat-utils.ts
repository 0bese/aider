// chat-utils.ts

import type { Attachment } from "@/components/ai-elements";
import { UIMessage } from 'ai';

/**
 * Narrowed part union based on documented UIMessagePart types we need:
 * - TextUIPart
 * - ReasoningUIPart
 * - SourceUrlUIPart
 * - SourceDocumentUIPart
 * - FileUIPart
 * - ToolUIPart<TOOLS> (generic over tools)
 *
 * We include a generic "tool-*" matcher via runtime parsing of the type string.
 */

type AnyUIPart =
  | { type: 'text'; text: string; state?: 'streaming' | 'done' }
  | { type: 'reasoning'; text: string; state?: 'streaming' | 'done'; providerMetadata?: Record<string, any> }
  | { type: 'source-url'; sourceId: string; url: string; title?: string; providerMetadata?: Record<string, any> }
  | { type: 'source-document'; sourceId: string; mediaType: string; title: string; filename?: string; providerMetadata?: Record<string, any> }
  | { type: 'file'; mediaType: string; filename?: string; url: string }
  | {
      // ToolUIPart runtime shape (union across tool states)
      type: `tool-${string}`;
      toolCallId: string;
      // union state payloads; we model as optional fields here and rely on state discriminator
      state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
      input?: unknown;
      output?: unknown;
      errorText?: string;
      providerExecuted?: boolean;
    }
  // Allow any other parts to flow through; we’ll ignore them.
  | { type: string; [key: string]: unknown };

/**
 * Local data shapes for your UI usage
 */
export type SourceData = {
  href?: string;
  title: string;
  description?: string;
  sourceId: string;
};

export type ReasoningData = {
  content: string;
  duration?: number | string;
};

export type ToolCallData = {
  name: string; // tool name extracted from type, e.g., "someTool" from "tool-someTool"
  toolCallId: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: unknown;
  output?: unknown;
  errorText?: string;
  providerExecuted?: boolean;
};

/**
 * Type Guards
 */
const isTextPart = (part: AnyUIPart): part is Extract<AnyUIPart, { type: 'text' }> =>
  part.type === 'text';

const isReasoningPart = (part: AnyUIPart): part is Extract<AnyUIPart, { type: 'reasoning' }> =>
  part.type === 'reasoning';

const isSourceUrlPart = (part: AnyUIPart): part is Extract<AnyUIPart, { type: 'source-url' }> =>
  part.type === 'source-url';

const isSourceDocumentPart = (part: AnyUIPart): part is Extract<AnyUIPart, { type: 'source-document' }> =>
  part.type === 'source-document';

const isFilePart = (part: AnyUIPart): part is Extract<AnyUIPart, { type: 'file' }> =>
  part.type === 'file';

const isToolPart = (part: AnyUIPart): part is Extract<AnyUIPart, { type: `tool-${string}` }> =>
  typeof part.type === 'string' && part.type.startsWith('tool-') && typeof (part as any).toolCallId === 'string';

/**
 * Utils operate on message.parts directly, so they accept UIMessage<any, any, any>
 */

/**
 * Extract SourceData from source-url and source-document parts.
 */
export const extractSources = (
  messageOrParts: UIMessage['parts'] | UIMessage['parts'][]
): SourceData[] => {
  const parts = Array.isArray(messageOrParts) ? (messageOrParts as AnyUIPart[]) : (messageOrParts as AnyUIPart[]);

  return parts
    .filter((part) => isSourceUrlPart(part) || isSourceDocumentPart(part))
    .map((part) => {
      if (isSourceUrlPart(part)) {
        return {
          href: part.url,
          title: part.title ?? 'Source',
          description: undefined,
          sourceId: part.sourceId,
        };
      }

      return {
        href: undefined,
        title: part.title ?? 'Source',
        description: undefined,
        sourceId: part.sourceId,
      };
    });
};

/**
 * Extract reasoning metadata.
 */
export const extractReasoning = (
  messageOrParts: UIMessage['parts'] | UIMessage['parts'][]
): ReasoningData | null => {
  const parts = Array.isArray(messageOrParts) ? (messageOrParts as AnyUIPart[]) : (messageOrParts as AnyUIPart[]);

  const reasoningPart = parts.find((p) => isReasoningPart(p));
  if (!reasoningPart) return null;

  const duration = (() => {
    const meta = reasoningPart.providerMetadata;
    if (!meta) return undefined;
    if (typeof (meta as any).duration === 'number' || typeof (meta as any).duration === 'string') return (meta as any).duration;
    if (typeof (meta as any).latencyMs === 'number') return (meta as any).latencyMs;
    return undefined;
  })();

  return {
    content: reasoningPart.text ?? '',
    duration,
  };
};

/**
 * Concatenate text content from all text parts.
 */
export const getTextContent = (
  messageOrParts: UIMessage['parts'] | UIMessage['parts'][]
): string => {
  const parts = Array.isArray(messageOrParts) ? (messageOrParts as AnyUIPart[]) : (messageOrParts as AnyUIPart[]);
  return parts
    .filter((p) => isTextPart(p))
    .map((p) => p.text ?? '')
    .join('');
};

/**
 * Convert file parts to your Attachment shape.
 * Images should come as 'file' with image/* mediaType.
 */
export const extractAttachments = (
  messageOrParts: UIMessage['parts'] | UIMessage['parts'][]
): Attachment[] => {
  const parts = Array.isArray(messageOrParts) ? (messageOrParts as AnyUIPart[]) : (messageOrParts as AnyUIPart[]);

  const files = parts.filter((p) => isFilePart(p));

  return files.map((part, index) => {
    const name = part.filename ?? `Attachment ${index + 1}`;
    const type = part.mediaType ?? 'application/octet-stream';
    const uri = part.url ?? '';

    return {
      id: `att-${index}`,
      name,
      size: 0,
      type,
      uri,
    };
  });
};

/**
 * Extract tool call parts into a normalized ToolCallData array.
 * Handles all four documented states:
 * - input-streaming (partial input)
 * - input-available (final input)
 * - output-available (final output)
 * - output-error (errorText present)
 */
export const extractToolCalls = (
  messageOrParts: UIMessage['parts'] | UIMessage['parts'][]
): ToolCallData[] => {
  const parts = Array.isArray(messageOrParts) ? (messageOrParts as AnyUIPart[]) : (messageOrParts as AnyUIPart[]);

  return parts
    .filter((p) => isToolPart(p))
    .map((p) => {
      const name = p.type.replace(/^tool-/, '');
      return {
        name,
        toolCallId: p.toolCallId,
        state: p.state,
        input: p.input,
        output: p.output,
        errorText: p.errorText,
        providerExecuted: p.providerExecuted,
      } satisfies ToolCallData;
    });
};

// Constants
export const SCROLL_DELAY = 100;
export const SCROLL_INTERVAL = 100;
export const COPY_FEEDBACK_DURATION = 500;
export const INPUT_MIN_HEIGHT = 50;
