import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

import { createProviderRegistry } from "ai";

export const createRegistry = (apiKey: string) => createProviderRegistry({
  google: createGoogleGenerativeAI({
    apiKey,
  }),
  openai: createOpenAI({
    apiKey,
  }),
  anthropic: createOpenAI({
    apiKey,
    baseURL: "https://api.anthropic.com/v1/"
  }),
});