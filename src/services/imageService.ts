/**
 * Image Service
 * 
 * Handles the generation of images using the Replicate API
 * Designed to be flexible for different models and providers
 */

import Replicate from "replicate";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { LandingPageSchema } from "../utils/parsers.js";

/**
 * Options for image generation
 */
export interface ImageGenerationOptions {
  model?: string;         // Defaults to the configured default model
  aspectRatio?: string;   // Aspect ratio like "1:1", "3:2", "2:3" (model-dependent)
  numOutputs?: number;    // Number of images to generate (default: 1)
  seed?: number;          // Optional seed for reproducibility
  width?: number;         // Width in pixels (for models that support it)
  height?: number;        // Height in pixels (for models that support it)
  extraParams?: Record<string, any>; // Model-specific parameters
  prompt?: string;        // The text prompt for image generation (used internally)
}

/**
 * Result from image generation
 */
export interface ImageGenerationResult {
  success: boolean;
  images: string[];       // Array of image URLs or base64 data
  modelUsed: string;      // Which model was used for generation
  localPaths?: string[];  // Paths to saved local files (if saved)
  error?: string;         // Error message if success is false
}

/**
 * Input parameters for OpenAI's image model
 */
interface OpenAIImageInput {
  prompt: string;
  aspect_ratio: string;
  num_outputs: number;
  openai_api_key?: string;
  output_format: string;
  [key: string]: any; // For additional parameters
}

/**
 * Input parameters for Flux Schnell model
 */
interface FluxSchnellInput {
  prompt: string;
  width?: number;
  height?: number;
  aspect_ratio?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  negative_prompt?: string;
  scheduler?: string;
  seed?: number;
  output_format: string;
  output_quality: number;
  [key: string]: any; // For additional parameters
}

// Model specific configurations and validations
interface ModelConfig {
  defaultParams: Record<string, any>;
  validateInput: (options: ImageGenerationOptions) => Record<string, any>;
  requiresApiKey?: boolean;
  apiKeyEnvVar?: string;
}

// Supported aspect ratios for openai/gpt-image-1 model
const SUPPORTED_ASPECT_RATIOS = ["1:1", "3:2", "2:3"];

// Model configurations
const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "openai/gpt-image-1": {
    defaultParams: {
      aspectRatio: "1:1",
      numOutputs: 1
    },
    validateInput: (options) => {
      // Get requested aspect ratio and validate it
      let requestedAspectRatio = options.aspectRatio || "1:1";
      let validatedAspectRatio = getSupportedAspectRatio(requestedAspectRatio);
      
      if (validatedAspectRatio !== requestedAspectRatio) {
        console.log(`⚠️ Aspect ratio "${requestedAspectRatio}" not supported, using "${validatedAspectRatio}" instead`);
      }
      
      const input: OpenAIImageInput = {
        prompt: options.prompt || "",
        aspect_ratio: validatedAspectRatio,
        num_outputs: options.numOutputs || 1,
        output_format: "png"
      };
      
      // Add OpenAI API key
      input.openai_api_key = process.env.OPENAI_API_KEY;
      
      return input;
    },
    requiresApiKey: true,
    apiKeyEnvVar: "OPENAI_API_KEY"
  },
  "black-forest-labs/flux-schnell": {
    defaultParams: {
      width: 768,
      height: 768,
      num_inference_steps: 30,
      guidance_scale: 8.0
    },
    validateInput: (options) => {
      // For Flux Schnell, we use aspect_ratio directly
      const input: FluxSchnellInput = {
        prompt: options.prompt || "",
        num_inference_steps: 4,
        guidance_scale: 8.0,
        output_format: "png",
        output_quality: 100
      };
      
      // Prefer aspect_ratio if provided
      if (options.aspectRatio) {
        input.aspect_ratio = options.aspectRatio;
        console.log(`ℹ️ Using aspect_ratio: ${options.aspectRatio}`);
      }
      // If nothing provided, use defaults
      else {
        input.width = 768;
        input.height = 768;
        console.log(`ℹ️ Using default dimensions: 768x768px`);
      }
      
      // Add seed if provided
      if (options.seed) {
        input.seed = options.seed;
      }
      
      return input;
    }
  }
};

// Default configuration based on environment or fallback
const DEFAULT_CONFIG = {
  model: process.env.REPLICATE_MODEL || "openai/gpt-image-1",
  aspectRatio: "1:1",
  numOutputs: 1
};

/**
 * Helper to parse aspect ratio string into width and height components
 * @param aspectRatio - Aspect ratio string (e.g., "16:9")
 * @returns [width, height] numeric values
 */
function parseAspectRatio(aspectRatio: string): [number, number] {
  const parts = aspectRatio.split(':');
  if (parts.length !== 2) {
    return [1, 1]; // Default to square if format is invalid
  }
  
  const width = parseInt(parts[0], 10);
  const height = parseInt(parts[1], 10);
  
  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return [1, 1]; // Default to square if invalid numbers
  }
  
  return [width, height];
}

/**
 * Initialize and return a Replicate client
 * @returns Replicate client
 * @throws Error if API token is not set
 */
const getReplicateClient = () => {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error('REPLICATE_API_TOKEN is not set in environment variables');
  }
  return new Replicate({ auth: apiToken });
};

/**
 * Validate and return a supported aspect ratio
 * @param aspectRatio - The requested aspect ratio
 * @returns A supported aspect ratio
 */
const getSupportedAspectRatio = (aspectRatio: string): string => {
  // If the requested aspect ratio is supported, use it
  if (SUPPORTED_ASPECT_RATIOS.includes(aspectRatio)) {
    return aspectRatio;
  }
  
  // Otherwise, map to the closest supported ratio
  // For widescreen formats like 16:9, use 3:2 (landscape)
  if (aspectRatio === "16:9" || aspectRatio === "4:3") {
    return "3:2";
  }
  
  // For portrait formats, use 2:3
  if (aspectRatio === "9:16" || aspectRatio === "3:4") {
    return "2:3";
  }
  
  // Default to square if no matching format
  return "1:1";
};

/**
 * Generate an image using Replicate API
 * @param prompt - The text prompt for image generation
 * @param options - Optional parameters for generation
 * @returns Result of image generation
 */
export async function generateImage(
  prompt: string,
  options: Omit<ImageGenerationOptions, 'prompt'> = {}
): Promise<ImageGenerationResult> {
  try {
    const replicate = getReplicateClient();
    const modelId = options.model || process.env.REPLICATE_MODEL || DEFAULT_CONFIG.model;
    
    // Make sure we have configuration for this model
    if (!MODEL_CONFIGS[modelId]) {
      throw new Error(`Unsupported model: ${modelId}. Currently supported models: ${Object.keys(MODEL_CONFIGS).join(', ')}`);
    }
    
    const modelConfig = MODEL_CONFIGS[modelId];
    
    // Check if model requires an API key
    if (modelConfig.requiresApiKey && modelConfig.apiKeyEnvVar) {
      const apiKey = process.env[modelConfig.apiKeyEnvVar];
      if (!apiKey) {
        throw new Error(`${modelConfig.apiKeyEnvVar} is required for the ${modelId} model`);
      }
    }
    
    console.log(`🎨 Generating image with model ${modelId}`);
    console.log(`🔤 Prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
    
    // Combine prompt with options for validation
    const fullOptions = {
      ...options,
      prompt
    };
    
    // Validate and prepare input based on the model
    const input = modelConfig.validateInput(fullOptions);
    
    // Call the API with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let output;
    
    while (attempts < maxAttempts) {
      try {
        // Run model prediction
        output = await replicate.run(modelId as `${string}/${string}` | `${string}/${string}:${string}`, { input });
        break; // Success, exit retry loop
      } catch (retryError) {
        attempts++;
        if (attempts >= maxAttempts) throw retryError;
        
        // Exponential backoff
        const delay = 1000 * Math.pow(2, attempts - 1);
        console.log(`Image generation attempt ${attempts} failed, retrying in ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Process the response
    const images = Array.isArray(output) ? output : [output];
    
    console.log(`✅ Successfully generated ${images.length} image(s)`);
    
    return {
      success: true,
      images,
      modelUsed: modelId
    };
  } catch (error) {
    console.error('❌ Image generation failed:', error);
    return {
      success: false,
      images: [],
      modelUsed: options.model || process.env.REPLICATE_MODEL || DEFAULT_CONFIG.model,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Generate images for all image prompts in a schema
 * @param schema - The landing page schema with image prompts
 * @param options - Optional parameters to apply to all image generation requests
 * @returns Record of image generation results keyed by prompt name
 */
export async function generateImagesFromSchema(
  schema: LandingPageSchema,
  options: Omit<ImageGenerationOptions, 'prompt'> = {}
): Promise<Record<string, ImageGenerationResult>> {
  const results: Record<string, ImageGenerationResult> = {};
  
  // Get model from options or environment
  const modelId = options.model || process.env.REPLICATE_MODEL || DEFAULT_CONFIG.model;
  console.log(`🖼️ Generating images using model: ${modelId}`);
  
  // Generate image for each image prompt in the schema
  for (const [key, prompt] of Object.entries(schema.imagePrompts)) {
    console.log(`🖼️ Generating image for ${key}...`);
    
    const imageOptions = { ...options };
    
    // Customize options based on image type
    if (modelId === "openai/gpt-image-1") {
      // Hero images typically look better in landscape format for OpenAI
      if (key === "hero") {
        imageOptions.aspectRatio = "3:2";
      } else {
        imageOptions.aspectRatio = "1:1";
      }
    } else if (modelId === "black-forest-labs/flux-schnell") {
      // For Flux model, use appropriate aspect ratios or dimensions
      if (key === "hero") {
        imageOptions.aspectRatio = "16:9"; // Use aspect ratio directly now
      } else {
        imageOptions.aspectRatio = "1:1"; // Square aspect ratio
      }
    }
    
    results[key] = await generateImage(prompt, imageOptions);
  }
  
  return results;
}

/**
 * Save generated images to disk
 * @param imageResults - Record of image generation results
 * @param outputDir - Base output directory
 * @param siteName - Name of the site (for directory naming)
 * @returns The updated imageResults with localPaths as relative paths for the template
 */
export async function saveGeneratedImages(
  imageResults: Record<string, ImageGenerationResult>,
  outputDir: string,
  siteName: string
): Promise<Record<string, ImageGenerationResult>> {
  const siteDirName = siteName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const siteImagesDir = path.join(outputDir, siteDirName, 'images');
  
  // Create the images directory
  await mkdir(siteImagesDir, { recursive: true });
  console.log(`📁 Created images directory: ${siteImagesDir}`);
  
  // Save each image
  for (const [key, result] of Object.entries(imageResults)) {
    if (!result.success || result.images.length === 0) continue;
    
    // For each image in the result
    for (const [index, imageUrl] of result.images.entries()) {
      try {
        // Fetch the image data
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const imageBuffer = await response.arrayBuffer();
        
        // Save to disk
        const fileName = `${key}${index > 0 ? `-${index}` : ''}.png`;
        const filePath = path.join(siteImagesDir, fileName);
        await writeFile(filePath, Buffer.from(imageBuffer));
        
        // Add local path to result
        if (!result.localPaths) result.localPaths = [];
        result.localPaths.push(filePath);
        
        console.log(`💾 Saved image for ${key} to ${path.basename(filePath)}`);
      } catch (error) {
        console.error(`Failed to save image for ${key}:`, error);
      }
    }
  }
  
  return imageResults;
} 