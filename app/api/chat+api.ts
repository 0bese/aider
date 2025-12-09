import { createRegistry } from "@/lib/ai-config";
import {
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { z } from "zod/v4";

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[], model: any} = await req.json();
  console.error("message in backend", JSON.stringify(messages, null, 2));

  const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "");
  console.error("api key", apiKey);
  if (!apiKey) {
    return new Response("Unauthorized", { status: 401 });
  }

  const registry = createRegistry(apiKey);
  const result = streamText({
    model: registry.languageModel(model),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(15),
    providerOptions: {
      google: {
        smoothStream: true,
        reasoningDepth: 1,
        reasoningMode: "basic",
      },
    },
    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: "word",
    }),
    tools: {
      // google_search: google.tools.googleSearch({}),
      weather: tool({
        description: "Get the weather in a location (fahrenheit)",
        inputSchema: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
      convertFahrenheitToCelsius: tool({
        description: "Convert a temperature in fahrenheit to celsius",
        inputSchema: z.object({
          temperature: z
            .number()
            .describe("The temperature in fahrenheit to convert"),
        }),
        execute: async ({ temperature }) => {
          const celsius = Math.round((temperature - 32) * (5 / 9));
          return {
            celsius,
          };
        },
      }),
    },
  });
  console.error("result", JSON.stringify(result, null, 2));

  return result.toUIMessageStreamResponse({
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
