import { generateText } from "ai";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response("Prompt is required", { status: 400 });
  }

  try {
    const  image  = await generateText({
      model: "google/gemini-3-pro-image",
      prompt,
    });

    console.log(image)

    return new Response(JSON.stringify({ image }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate image" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
