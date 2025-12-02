import { Image } from "expo-image";
import { Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function ImageGenScreen() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      if (data.image) {
        setImage(`data:image/png;base64,${data.image}`);
      } else {
        throw new Error("No image data received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Image Generation" }} />
      <TextInput
        style={styles.input}
        placeholder="Enter a prompt..."
        value={prompt}
        onChangeText={setPrompt}
        multiline
      />
      <Button title="Generate" onPress={generateImage} disabled={loading || !prompt} />
      
      {loading && <ActivityIndicator style={styles.loader} size="large" />}
      {error && <Text style={styles.error}>{error}</Text>}
      
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
          contentFit="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: "top",
  },
  loader: {
    marginTop: 20,
  },
  error: {
    color: "red",
    marginTop: 20,
    textAlign: "center",
  },
  image: {
    flex: 1,
    marginTop: 20,
    borderRadius: 8,
    width: "100%",
  },
});
