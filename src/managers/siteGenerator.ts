/**
 * Site Generator Module
 * 
 * Handles the generation of HTML and CSS files based on the approved schema
 * and EJS templates.
 */

import ejs from 'ejs';
import { join } from 'path';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import callLLM for content refinement
import { callLLM } from '../services/llmService.js';

// Import image generation services
import { 
  generateImagesFromSchema, 
  saveGeneratedImages,
  ImageGenerationResult 
} from '../services/imageService.js';

// Import schema type
import { LandingPageSchema as SiteSchema } from '../utils/parsers.js';

// Define interfaces
interface GeneratedImages {
  urls?: Record<string, string>;
  localPaths?: Record<string, string>;
}

interface LLMService {
  callLLM: (prompt: string, options?: any) => Promise<string>;
}

/**
 * Interface for the site files
 */
export interface SiteFiles {
  html: string;
  css: string;
  successPage: string;
  generatedImages?: GeneratedImages;
}

/**
 * Generate a content refinement prompt based on schema data
 * @param selectedIdea The idea selected by the user
 * @param designPreferences The design preferences specified by the user
 * @param schema The full schema object
 * @returns A prompt string for the LLM
 */
function generateContentRefinementPrompt(selectedIdea: string, designPreferences: string, schema: Record<string, any>): string {
  return `You are an expert copywriter specializing in landing pages. Refine the following copy blocks for a startup idea:
"${selectedIdea}"

The design style is: "${designPreferences}"
The brand name is: "${schema.brandName}"
The target audience: People interested in solutions related to this idea.

Original copy blocks:
${JSON.stringify(schema.copyBlocks, null, 2)}

Transform these blocks using these principles:
1. Use a tone that matches the "${designPreferences}" design style
2. Identify potential SEO keywords related to the idea
3. Improve the headline by making it more compelling and attention-grabbing, including a key benefit (max 10 words)
4. Ensure the subheadline clearly explains the value proposition (max 20 words)
5. Make feature descriptions concrete and benefit-focused
6. Create a compelling call to action that creates urgency

Return ONLY a JSON object with the same structure as the original, but with enhanced copy.`;
}

/**
 * Refines the content in the schema using the LLM
 * @param schema Site schema
 * @param llmService LLM service for content refinement
 * @returns Refined schema
 */
async function refineContent(schema: SiteSchema, llmService: LLMService): Promise<SiteSchema> {
  console.log('✨ Refining content for better engagement...');
  
  try {
    // Create a refinement prompt based on schema content
    const refinementPrompt = `
    You are a professional copywriter. Please refine the following website content to be more engaging,
    persuasive, and aligned with the brand voice. The brand is "${schema.brandName}" with the following
    characteristics:
    - Industry/Product: ${(schema as any).industry || "Technology"}
    - Design style: ${(schema as any).designStyle || "Modern"}
    
    Current content:
    - Headline: "${schema.copyBlocks.headline}"
    - Subheadline: "${schema.copyBlocks.subheadline}"
    - Value Proposition: "${schema.copyBlocks.valueProposition}"
    - Call to Action: "${schema.copyBlocks.callToAction}"
    
    Please provide improved versions of each text element. Return ONLY the refined text in JSON format:
    {
      "headline": "refined headline",
      "subheadline": "refined subheadline",
      "valueProposition": "refined value proposition",
      "callToAction": "refined call to action"
    }
    `;
    
    const refinedContentString = await llmService.callLLM(refinementPrompt);
    
    try {
      // Extract JSON from potential markdown response
      let jsonString = refinedContentString;
      
      // Remove markdown code blocks if present
      if (refinedContentString.includes('```json')) {
        jsonString = refinedContentString.replace(/```json\n|\n```/g, '');
      } else if (refinedContentString.includes('```')) {
        jsonString = refinedContentString.replace(/```\n|\n```/g, '');
      }
      
      // Parse the JSON
      const refinedContent = JSON.parse(jsonString);
      
      // Update the schema with refined content
      const refinedSchema = { 
        ...schema,
        copyBlocks: {
          ...schema.copyBlocks,
          ...refinedContent
        }
      };
      
      console.log('✅ Content successfully refined for improved engagement');
      return refinedSchema;
    } catch (parseError) {
      console.warn('⚠️ Failed to parse refined content:', parseError instanceof Error ? parseError.message : String(parseError));
      console.log('Continuing with original content...');
      return schema;
    }
  } catch (error) {
    console.warn('⚠️ Content refinement skipped due to error:', error instanceof Error ? error.message : String(error));
    console.log('Continuing with original content...');
    return schema;
  }
}

/**
 * Generates a success page for form submissions
 * @param schema Site schema
 * @returns HTML content for the success page
 */
async function generateSuccessPage(schema: SiteSchema): Promise<string> {
  const successHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - ${schema.brandName}</title>
  <link rel="stylesheet" href="../style.css">
  <!-- Add Google Fonts based on schema -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${schema.font.heading.replace(' ', '+')}&family=${schema.font.body.replace(' ', '+')}&display=swap" rel="stylesheet">
  <style>
    .success-container {
      text-align: center;
      padding: 3rem 1rem;
    }
    .success-icon {
      font-size: 4rem;
      color: var(--accent-color);
      margin-bottom: 2rem;
    }
    .back-button {
      display: inline-block;
      margin-top: 2rem;
      padding: 0.75rem 1.5rem;
      background-color: var(--primary-color);
      color: #ffffff;
      text-decoration: none;
      border-radius: 0.25rem;
      font-weight: bold;
    }
    .back-button:hover {
      background-color: var(--secondary-color);
    }
  </style>
</head>
<body>
  <div class="container success-container">
    <div class="success-icon">✓</div>
    <h1>Thank You!</h1>
    <p>Your message has been successfully submitted. We'll be in touch soon!</p>
    <a href="/" class="back-button">Return to Home</a>
  </div>
</body>
</html>
  `;
  
  return successHtml;
}

/**
 * Generates site files (HTML & CSS) from the provided schema
 * @param schema Site schema
 * @param doContentRefinement Whether to refine content using the LLM
 * @param llmService LLM service for content refinement (optional)
 * @param imageGeneration Whether to generate images for the site
 * @param imageService Image service for image generation (optional)
 * @returns Object containing the rendered HTML and CSS content
 */
export async function generateSiteFiles(
  schema: SiteSchema,
  doContentRefinement: boolean = false,
  llmService?: LLMService,
  imageGeneration: boolean = false,
  imageService?: any
): Promise<{ html: string; css: string; successPage: string; generatedImages?: GeneratedImages }> {
  console.log('🏗️ Generating site files from schema...');
  
  let refinedSchema = schema;
  let generatedImages: GeneratedImages | undefined;
  
  // Refine content if requested
  if (doContentRefinement && llmService) {
    refinedSchema = await refineContent(schema, llmService);
  }
  
  // Generate images if requested
  if (imageGeneration && imageService) {
    try {
      console.log('🖼️ Generating images for landing page...');
      const imageResults = await imageService.generateImagesFromSchema(refinedSchema);
      
      // Save images to disk
      console.log('💾 Saving generated images...');
      const baseOutputDir = path.resolve(process.cwd(), 'output');
      const sanitizedSiteName = refinedSchema.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const updatedResults = await imageService.saveGeneratedImages(
        imageResults, 
        baseOutputDir, 
        refinedSchema.brandName
      );
      
      // Update schema with image paths for template rendering
      generatedImages = { localPaths: {} };
      
      for (const [key, result] of Object.entries(updatedResults)) {
        const typedResult = result as ImageGenerationResult;
        if (typedResult.success && typedResult.localPaths && typedResult.localPaths.length > 0) {
          // Use relative path for template - image path needs to be relative to the site directory
          if (generatedImages.localPaths) {
            // Convert absolute path to relative path for the template
            // e.g., "/path/to/output/sitename/images/hero.png" -> "images/hero.png"
            const filename = path.basename(typedResult.localPaths[0]);
            generatedImages.localPaths[key] = `images/${filename}`;
            console.log(`✅ Added image path for ${key}: ${generatedImages.localPaths[key]}`);
          }
        }
      }
      
      console.log('✅ Successfully processed all images');
    } catch (error) {
      console.error('⚠️ Error generating images:', error);
      console.log('Continuing with site generation without images...');
    }
  }
  
  // Template paths
  const templateDir = path.resolve(fileURLToPath(import.meta.url), '../../templates');
  const htmlTemplatePath = path.join(templateDir, 'index.ejs');
  const cssTemplatePath = path.join(templateDir, 'style.ejs');
  
  // Render HTML and CSS using EJS templates
  try {
    const html = await ejs.renderFile(htmlTemplatePath, {
      ...refinedSchema,
      generatedImages: generatedImages && generatedImages.localPaths ? generatedImages.localPaths : undefined
    });
    
    const css = await ejs.renderFile(cssTemplatePath, refinedSchema);
    
    // Generate success page
    const successPage = await generateSuccessPage(refinedSchema);
    
    return { html, css, successPage, generatedImages };
  } catch (error) {
    console.error('❌ Failed to render templates:', error);
    throw new Error(`Template rendering failed: ${error instanceof Error ? error.message : String(error)}`);
  }
} 