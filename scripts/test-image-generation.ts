/**
 * Test script for image generation
 * 
 * This script demonstrates the image generation functionality
 * using the imageService module with different models
 */

import 'dotenv/config';
import { 
  generateImage, 
  saveGeneratedImages, 
  ImageGenerationResult,
  ImageGenerationOptions
} from '../src/services/imageService.js';
import path from 'path';
import fs from 'fs/promises';

async function testImageGeneration() {
  console.log('🚀 Testing image generation service...');
  
  try {
    // Create a test output directory
    const testOutputDir = path.resolve(process.cwd(), 'test-output', 'image-test');
    await fs.mkdir(testOutputDir, { recursive: true });
    
    // Get the model to test (from env or use a default)
    const model = process.env.REPLICATE_MODEL || "openai/gpt-image-1";
    console.log(`\n🔧 Using model: ${model}`);
    console.log(`🖼️ Output format: PNG ${model === "black-forest-labs/flux-schnell" ? "with quality 100" : ""}`);
    
    // Test a simple image generation
    const prompt = "A modern app interface showing eco-friendly transportation options with clean design, light green colors, and minimalist icons";
    console.log(`\n📝 Testing image generation with prompt: "${prompt}"`);
    
    // Configure options based on model
    const options: Omit<ImageGenerationOptions, 'prompt'> = {
      model,
      numOutputs: 1 // Just one output for testing
    };
    
    // Set model-specific parameters
    if (model === "openai/gpt-image-1") {
      options.aspectRatio = "3:2"; // Landscape format
    } else if (model === "black-forest-labs/flux-schnell") {
      options.aspectRatio = "16:9"; // Using aspect_ratio directly now
    }
    
    console.log(`🖌️ Options: ${JSON.stringify(options, null, 2)}`);
    
    const result = await generateImage(prompt, options);
    
    if (!result.success) {
      console.error(`❌ Image generation failed: ${result.error}`);
      return;
    }
    
    console.log('✅ Image generation successful!');
    console.log(`🖼️ Generated ${result.images.length} image(s)`);
    
    // Save the images
    console.log('\n💾 Saving generated images...');
    
    // Create a results object in the format saveGeneratedImages expects
    const imageResults: Record<string, ImageGenerationResult> = {
      'test-image': result
    };
    
    await saveGeneratedImages(imageResults, testOutputDir, 'test-site');
    
    console.log(`\n✨ Test completed successfully! Check images in: ${testOutputDir}/test-site/images`);
    
    // Create a simple HTML file to view the image
    const viewerContent = `<!DOCTYPE html>
<html>
<head>
  <title>Image Generation Test</title>
  <style>
    body { font-family: -apple-system, sans-serif; margin: 20px; }
    h1 { color: #2E7D32; }
    .image-container { max-width: 800px; margin: 20px 0; }
    img { max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto; }
  </style>
</head>
<body>
  <h1>Image Generation Test</h1>
  <div class="image-container">
    <h2>Generated Image</h2>
    <img src="test-site/images/test-image.png" alt="Test image">
  </div>
  <div>
    <h2>Prompt</h2>
    <pre>${prompt}</pre>
  </div>
  <div>
    <h2>Parameters</h2>
    <pre>Model: ${model}
${JSON.stringify(options, null, 2)}</pre>
  </div>
</body>
</html>`;
    
    await fs.writeFile(path.join(testOutputDir, 'view-image.html'), viewerContent);
    console.log(`🌐 Open this file to view the generated image: ${path.join(testOutputDir, 'view-image.html')}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testImageGeneration(); 