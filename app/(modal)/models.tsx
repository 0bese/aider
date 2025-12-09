import { ClaudeLogo, GeminiLogo, OpenAILogo } from "@/components/model-logo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Storage } from "@/lib/storage";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useMMKVString } from "react-native-mmkv";

export default function ModelsScreen() {
  const [openaiKey, setOpenaiKey] = useMMKVString("openai_apikey", Storage);
  const [googleKey, setGoogleKey] = useMMKVString("google_apikey", Storage);
  const [anthropicKey, setAnthropicKey] = useMMKVString("anthropic_apikey", Storage);

  // temporary local states
  const [tempOpenAI, setTempOpenAI] = useState(openaiKey || "");
  const [tempGoogle, setTempGoogle] = useState(googleKey || "");
  const [tempAnthropic, setTempAnthropic] = useState(anthropicKey || "");

  const handleSave = (type: "openai" | "google" | "anthropic") => {
    switch (type) {
      case "openai":
        setOpenaiKey(tempOpenAI);
        setTempOpenAI("");
        break;
      case "google":
        setGoogleKey(tempGoogle);
        setTempGoogle("");
        break;
      case "anthropic":
        setAnthropicKey(tempAnthropic);
        setTempAnthropic("");
        break;
    }
  };

  const handleDelete = (type: "openai" | "google" | "anthropic") => {
    switch (type) {
      case "openai":
        setOpenaiKey(undefined);
        setTempOpenAI("");
        break;
      case "google":
        setGoogleKey(undefined);
        setTempGoogle("");
        break;
      case "anthropic":
        setAnthropicKey(undefined);
        setTempAnthropic("");
        break;
    }
  };

  return (
    <BlurView intensity={50} className="flex-1">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
          gap: 20,
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Accordion type="single" collapsible className="w-full">
          {/* OpenAI */}
          <AccordionItem value="openai">
            <AccordionTrigger>
              <View className="w-full flex-row justify-center items-center">
                <OpenAILogo />
              </View>
            </AccordionTrigger>
            <AccordionContent className="flex-col gap-3">
              <View className="bg-muted/30 p-4 rounded-xl gap-2 mb-2">
              {
                openaiKey ? (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={!openaiKey}
                    onPress={() => handleDelete("openai")}
                  >
                    <Text>Delete API Key</Text>
                  </Button>
                ) : (
                  <>
                  <Text className="font-medium">API Key</Text>
                <Input
                  placeholder="sk-..."
                  value={tempOpenAI}
                  onChangeText={setTempOpenAI}
                  className="bg-background"
                />
                  <Button
                    className="flex-1"
                    disabled={tempOpenAI === ""}
                    onPress={() => handleSave("openai")}
                  >
                    <Text>Save</Text>
                  </Button>
                  </>
                )
              }
              </View>
              {["GPT-4", "GPT-4 Turbo", "GPT-3.5 Turbo"].map((model) => (
                <View
                  key={model}
                  className="p-4 rounded-2xl bg-muted/40 border border-border"
                >
                  <Text className="font-medium text-foreground">{model}</Text>
                  <Text className="text-muted-foreground text-sm mt-1">
                    {model === "GPT-4"
                      ? "Advanced reasoning and creativity"
                      : model === "GPT-4 Turbo"
                      ? "Cheaper and faster GPT-4 variant"
                      : "Lightweight conversational model"}
                  </Text>
                </View>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Google */}
          <AccordionItem value="google">
            <AccordionTrigger>
              <View className="w-full flex-row justify-center items-center">
                <GeminiLogo />
              </View>
            </AccordionTrigger>
            <AccordionContent className="flex-col gap-3">
              <View className="bg-muted/30 p-4 rounded-xl gap-2 mb-2">
                {
                  googleKey ? (
                     <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={!googleKey}
                    onPress={() => handleDelete("google")}
                  >
                    <Text>Delete API Key</Text>
                  </Button>
                  ) : (
                    <>
                     <Text className="font-medium">API Key</Text>
                <Input
                  placeholder="AIza..."
                  value={tempGoogle}
                  onChangeText={setTempGoogle}
                  className="bg-background"
                />

                  <Button
                    className="flex-1"
                    onPress={() => handleSave("google")}
                    disabled={tempGoogle === ""}
                  >
                    <Text>Save</Text>
                  </Button>
                 
                    </>
                  )
                }
               

              </View>
              {["Gemini Pro", "Gemini Ultra", "Gemini Nano"].map((model) => (
                <View
                  key={model}
                  className="p-4 rounded-2xl bg-muted/40 border border-border"
                >
                  <Text className="font-medium text-foreground">{model}</Text>
                  <Text className="text-muted-foreground text-sm mt-1">
                    {model === "Gemini Ultra"
                      ? "Flagship multimodal model"
                      : model === "Gemini Pro"
                      ? "Balanced performance for AI apps"
                      : "Lightweight edge model"}
                  </Text>
                </View>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Anthropic */}
          <AccordionItem value="anthropic">
            <AccordionTrigger>
              <View className="w-full flex-row justify-center items-center">
                <ClaudeLogo />
              </View>
            </AccordionTrigger>
            <AccordionContent className="flex-col gap-3">
              <View className="bg-muted/30 p-4 rounded-xl gap-2 mb-2">
                {
                  anthropicKey ? (
                    <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={!anthropicKey}
                    onPress={() => handleDelete("anthropic")}
                  >
                    <Text>Delete API Key</Text>
                  </Button>
                  ) : (
                    <>
                    <Text className="font-medium">API Key</Text>
                <Input
                  placeholder="sk-ant-..."
                  value={tempAnthropic}
                  onChangeText={setTempAnthropic}
                  className="bg-background"
                />
                  <Button
                    className="flex-1"
                    onPress={() => handleSave("anthropic")}
                    disabled={tempAnthropic === ""}
                  >
                    <Text>Save</Text>
                  </Button>
                  </>
               )}

              </View>
              {["Claude Sonnet 4.5", "Claude Opus 4", "Claude Haiku 4.5"].map((model) => (
                <View
                  key={model}
                  className="p-4 rounded-2xl bg-muted/40 border border-border"
                >
                  <Text className="font-medium text-foreground">{model}</Text>
                  <Text className="text-muted-foreground text-sm mt-1">
                    {model === "Claude Opus 4"
                      ? "High-performance reasoning model"
                      : model === "Claude Sonnet 4.5"
                      ? "Fast and capable general-purpose model"
                      : "Optimized for speed and cost"}
                  </Text>
                </View>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollView>
    </BlurView>
  );
}
