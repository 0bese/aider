import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  streamText,
  UIMessage,
} from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  console.error("message in backend", messages);

  const result = streamText({
    model: google("gemini-2.5-flash",),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: "word",
    }),
    tools: {
      google_search: google.tools.googleSearch({}),
      // weather: tooname ({
      //   description: "Get the weather in a location (fahrenheit)",
      //   inputSchema: z.object({
      //     location: z.string().describe("The location to get the weather for"),
      //   }),
      //   execute: async ({ location }) => {
      //     const temperature = Math.round(Math.random() * (90 - 32) + 32);
      //     return {
      //       location,
      //       temperature,
      //     };
      //   },
      // }),
      // convertFahrenheitToCelsius: tool({
      //   description: "Convert a temperature in fahrenheit to celsius",
      //   inputSchema: z.object({
      //     temperature: z
      //       .number()
      //       .describe("The temperature in fahrenheit to convert"),
      //   }),
      //   execute: async ({ temperature }) => {
      //     const celsius = Math.round((temperature - 32) * (5 / 9));
      //     return {
      //       celsius,
      //     };
      //   },
      // }),
    },
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
