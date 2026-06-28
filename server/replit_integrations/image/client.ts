import fs from "node:fs";
import OpenAI, { toFile } from "openai";
import { Buffer } from "node:buffer";

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface Gpt4oImageResult {
  url: string;
  prompt: string;
  model: string;
  mimeType: string;
}

const GPT4O_STYLE_PREFIXES: Record<string, string> = {
  museum_photograph:
    "Museum-quality archival photograph of an ancient artifact, professional lighting, white background, high resolution, educational reference quality:",
  reconstruction:
    "Archaeological reconstruction illustration, scholarly accuracy, detailed academic style:",
  diagram:
    "Clean schematic diagram with labels, academic publication quality, clear line art on white background:",
  illustration:
    "Detailed historical illustration, Victorian-era scholarly engraving style, accurate period detail:",
};

// GPT-4o image generation model candidates, tried in order of preference.
// The Replit AI Integrations endpoint may not expose all of these; we fall back
// through the list and report the model that actually succeeded.
const GPT4O_IMAGE_MODELS = ["gpt-4o", "gpt-4o-image", "gpt-image-1"] as const;

export async function generateGpt4oImage(
  prompt: string,
  style: "museum_photograph" | "reconstruction" | "diagram" | "illustration" = "museum_photograph"
): Promise<Gpt4oImageResult | null> {
  const stylePrefix = GPT4O_STYLE_PREFIXES[style] ?? GPT4O_STYLE_PREFIXES.museum_photograph;
  const fullPrompt = `${stylePrefix} ${prompt}`;

  for (const model of GPT4O_IMAGE_MODELS) {
    try {
      const response = await openai.images.generate({
        model,
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
      } as Parameters<typeof openai.images.generate>[0]);

      const base64 = response.data?.[0]?.b64_json ?? "";
      if (!base64) {
        console.warn(`[GPT-4o] No image data returned from model ${model}`);
        continue;
      }

      console.log(`[GPT-4o] Image generated with model: ${model}`);
      const dataUrl = `data:image/png;base64,${base64}`;
      return { url: dataUrl, prompt: fullPrompt, model, mimeType: "image/png" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // If the error indicates model not found / not supported, try next candidate
      if (/model_not_found|invalid_model|unsupported|not.*support/i.test(msg)) {
        console.warn(`[GPT-4o] Model "${model}" not available, trying next: ${msg.slice(0, 120)}`);
        continue;
      }
      // Any other error (auth, rate limit, etc.) — surface immediately
      console.error(`[GPT-4o] Image generation error with model ${model}:`, msg.slice(0, 200));
      return null;
    }
  }

  console.error("[GPT-4o] All model candidates exhausted — image generation failed");
  return null;
}

/**
 * Generate an image and return as Buffer.
 * Uses gpt-image-1 model via Replit AI Integrations.
 */
export async function generateImageBuffer(
  prompt: string,
  size: "1024x1024" | "512x512" | "256x256" = "1024x1024"
): Promise<Buffer> {
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size,
  });
  const base64 = response.data[0]?.b64_json ?? "";
  return Buffer.from(base64, "base64");
}

/**
 * Edit/combine multiple images into a composite.
 * Uses gpt-image-1 model via Replit AI Integrations.
 */
export async function editImages(
  imageFiles: string[],
  prompt: string,
  outputPath?: string
): Promise<Buffer> {
  const images = await Promise.all(
    imageFiles.map((file) =>
      toFile(fs.createReadStream(file), file, {
        type: "image/png",
      })
    )
  );

  const response = await openai.images.edit({
    model: "gpt-image-1",
    image: images,
    prompt,
  });

  const imageBase64 = response.data[0]?.b64_json ?? "";
  const imageBytes = Buffer.from(imageBase64, "base64");

  if (outputPath) {
    fs.writeFileSync(outputPath, imageBytes);
  }

  return imageBytes;
}

