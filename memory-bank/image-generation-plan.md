# Image Generation Integration Plan

## Overview

We currently generate image prompts within our schema but don't create the actual images. This plan outlines how to integrate image generation capabilities using Replicate's API while maintaining our modular architecture and keeping the design flexible for future changes.

## API Selection

We will integrate with Replicate's image generation API:
- **API Provider**: Replicate
- **Default Model**: `openai/gpt-image-1`
- **Environment Variable**: `REPLICATE_API_TOKEN` (already added to .env)
- **Flexibility**: Design the integration to easily swap models or even providers

## Implementation Architecture

### 1. Create a New Service Module

Following our existing architecture pattern, create a new service module:

```
src/services/imageService.ts
```

This module will:
- Encapsulate all image generation API communication
- Provide a clean interface for the rest of the application
- Handle authentication, request formatting, and error management

### 2. Service Interface Design

```typescript
// Basic interfaces for the service
export interface ImageGenerationOptions {
  model?: string;         // Defaults to the configured default model
  width?: number;         // Image width (model-dependent)
  height?: number;        // Image height (model-dependent)
  numOutputs?: number;    // Number of images to generate (default: 1)
  seed?: number;          // Optional seed for reproducibility
  extraParams?: Record<string, any>; // Model-specific parameters
}

export interface ImageGenerationResult {
  success: boolean;
  images: string[];       // Array of image URLs or base64 data
  localPaths?: string[];  // Paths to saved local files (if saved)
  error?: string;         // Error message if success is false
}

// Main function signatures
export async function generateImage(
  prompt: string,
  options?: ImageGenerationOptions
): Promise<ImageGenerationResult>;

export async function generateImagesFromSchema(
  schema: LandingPageSchema
): Promise<Record<string, ImageGenerationResult>>;
```

### 3. Implementation Details

```typescript
import Replicate from "replicate";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { LandingPageSchema } from "../utils/parsers.js";

// Default configuration
const DEFAULT_CONFIG = {
  model: "openai/gpt-image-1",
  width: 1024,
  height: 768,
  numOutputs: 1
};

// Initialize Replicate client
const getReplicateClient = () => {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error('REPLICATE_API_TOKEN is not set in environment variables');
  }
  return new Replicate({ auth: apiToken });
};

export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<ImageGenerationResult> {
  try {
    const replicate = getReplicateClient();
    const modelId = options.model || DEFAULT_CONFIG.model;
    
    console.log(`Generating image with prompt: "${prompt.substring(0, 50)}..."`);
    
    // Prepare the input based on the model and options
    const input = {
      prompt,
      width: options.width || DEFAULT_CONFIG.width,
      height: options.height || DEFAULT_CONFIG.height,
      num_outputs: options.numOutputs || DEFAULT_CONFIG.numOutputs,
      ...options.extraParams
    };
    
    // Call the API
    const output = await replicate.run(modelId, { input });
    
    // Process the response
    const images = Array.isArray(output) ? output : [output];
    
    return {
      success: true,
      images
    };
  } catch (error) {
    console.error('Image generation failed:', error);
    return {
      success: false,
      images: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function generateImagesFromSchema(
  schema: LandingPageSchema
): Promise<Record<string, ImageGenerationResult>> {
  const results: Record<string, ImageGenerationResult> = {};
  
  // Generate image for each image prompt in the schema
  for (const [key, prompt] of Object.entries(schema.imagePrompts)) {
    console.log(`Generating image for ${key}...`);
    results[key] = await generateImage(prompt);
  }
  
  return results;
}

// Helper to save generated images to disk
export async function saveGeneratedImages(
  imageResults: Record<string, ImageGenerationResult>,
  outputDir: string,
  siteName: string
): Promise<void> {
  const siteImagesDir = path.join(outputDir, siteName.toLowerCase().replace(/[^a-z0-9]/g, '-'), 'images');
  
  // Create the images directory
  await mkdir(siteImagesDir, { recursive: true });
  
  // Save each image
  for (const [key, result] of Object.entries(imageResults)) {
    if (!result.success || result.images.length === 0) continue;
    
    // For each image in the result
    for (const [index, imageUrl] of result.images.entries()) {
      try {
        // Fetch the image data
        const response = await fetch(imageUrl);
        const imageBuffer = await response.arrayBuffer();
        
        // Save to disk
        const fileName = `${key}${index > 0 ? `-${index}` : ''}.png`;
        const filePath = path.join(siteImagesDir, fileName);
        await writeFile(filePath, Buffer.from(imageBuffer));
        
        // Add local path to result
        if (!result.localPaths) result.localPaths = [];
        result.localPaths.push(filePath);
        
        console.log(`Saved image for ${key} to ${filePath}`);
      } catch (error) {
        console.error(`Failed to save image for ${key}:`, error);
      }
    }
  }
}
```

### 4. Integration with SiteGenerator

Extend the `generateSiteFiles` function in `siteGenerator.ts` to optionally generate and include images:

```typescript
// New parameter in generateSiteFiles
export async function generateSiteFiles(
  schema: Record<string, any>,
  selectedIdea?: string,
  designPreferences?: string,
  enableRefinement: boolean = false,
  generateImages: boolean = false  // New parameter
): Promise<SiteFiles> {
  // Existing code...
  
  // Optional image generation
  let imageResults = {};
  if (generateImages) {
    try {
      console.log('Generating images for the landing page...');
      imageResults = await generateImagesFromSchema(schema);
      
      // Add image paths to schema for template use
      schema.generatedImages = {};
      for (const [key, result] of Object.entries(imageResults)) {
        if (result.success && result.localPaths && result.localPaths.length > 0) {
          // Use relative path for templates
          schema.generatedImages[key] = `images/${path.basename(result.localPaths[0])}`;
        }
      }
    } catch (imageError) {
      console.warn('Image generation skipped due to error:', imageError);
    }
  }
  
  // Existing template rendering code...
  
  // Save images after HTML/CSS are generated
  if (generateImages && Object.keys(imageResults).length > 0) {
    try {
      await saveGeneratedImages(imageResults, baseOutputDir, schema.brandName);
    } catch (saveError) {
      console.warn('Failed to save images:', saveError);
    }
  }
  
  // Return result with added image info
  return {
    htmlContent,
    cssContent,
    imageResults: Object.keys(imageResults).length > 0 ? imageResults : undefined
  };
}
```

### 5. Update EJS Templates

Modify `index.ejs` to use generated images when available:

```html
<div class="hero-image">
  <% if (generatedImages && generatedImages.hero) { %>
    <img src="<%= generatedImages.hero %>" alt="<%= imagePrompts.hero %>" class="generated-image">
  <% } else { %>
    <!-- Fallback to placeholder -->
    <div class="placeholder-image" aria-label="<%= imagePrompts.hero %>">
      <!-- Placeholder for hero image -->
    </div>
  <% } %>
</div>
```

### 6. Integration with Orchestrator (src/index.ts)

Update the main application flow to include image generation:

```typescript
// In the main run() function
// After schema generation and approval
console.log('\n🔨 Generating landing page files...');
const siteFiles: SiteFiles = await generateSiteFiles(
  schema, 
  selectedIdea,
  designStyle,
  true, // Enable content refinement
  true  // Enable image generation
);
```

## Handling API Rate Limits and Errors

1. **Implement Retry Logic**:
   - Add retry mechanism for temporary failures
   - Exponential backoff between retries

2. **Fallback Strategy**:
   - If image generation fails, the site will still render with placeholder divs
   - Store failed prompts for potential retry later

3. **Caching**:
   - Consider implementing a simple cache to avoid regenerating identical images
   - Cache could be based on a hash of the prompt

## Security Considerations

1. **API Key Management**:
   - Store the REPLICATE_API_TOKEN in the .env file (already implemented)
   - Never log or expose the API key in error messages

2. **Prompt Safety**:
   - Consider implementing a content filter on image prompts
   - Add safety parameters to the API calls

## Testing Strategy

1. Create a dedicated test script:
   ```
   scripts/test-image-generation.ts
   ```

2. Test with a variety of image prompts to ensure robustness

3. Test error handling by intentionally using invalid API keys or bad requests

## Future Enhancements

1. **Provider Abstraction**:
   - Create adapter classes for different providers (Replicate, DALL-E, Stability AI)
   - Implement a factory pattern to choose the provider at runtime

2. **Prompt Enhancement**:
   - Use LLM to enhance image prompts for better results
   - Add style modifiers based on the design preferences

3. **Image Optimization**:
   - Implement image compression and format conversion
   - Generate multiple sizes for responsive layouts

4. **UI Integration**:
   - Create a CLI option to enable/disable image generation
   - Allow user to regenerate individual images they don't like

## Implementation Timeline

1. Create basic `imageService.ts` with core functionality
2. Integrate with site generator
3. Update templates to use generated images
4. Add image saving functionality
5. Implement error handling and fallbacks
6. Create test script and validate
7. Document the feature

## Resources

- [Replicate API Documentation](https://replicate.com/docs)
- [openai/gpt-image-1 API](https://replicate.com/openai/gpt-image-1/api)
- [Node.js Fetch API](https://nodejs.org/api/globals.html#fetch)
- [Replicate Node.js Client](https://github.com/replicate/replicate-javascript)