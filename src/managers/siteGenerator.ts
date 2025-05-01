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

// Import callLLM for content refinement
import { callLLM } from '../services/llmService.js';

// Import image generation services
import { 
  generateImagesFromSchema, 
  saveGeneratedImages,
  ImageGenerationResult 
} from '../services/imageService.js';

// Import schema type
import { LandingPageSchema } from '../utils/parsers.js';

/**
 * Interface for the site files
 */
export interface SiteFiles {
  htmlContent: string;
  cssContent: string;
  imageResults?: Record<string, ImageGenerationResult>;
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
 * Generates site files (HTML and CSS) based on the provided schema
 * @param {Object} schema The approved schema object containing all site content and styling
 * @param {string} selectedIdea The idea selected by the user (for content refinement)
 * @param {string} designPreferences The design preferences specified by the user (for content refinement)
 * @param {boolean} enableRefinement Whether to enable content refinement (default: false)
 * @param {boolean} generateImages Whether to generate images using AI (default: false)
 * @returns {Promise<SiteFiles>} Object containing htmlContent and cssContent strings
 */
export async function generateSiteFiles(
  schema: Record<string, any>,
  selectedIdea?: string,
  designPreferences?: string,
  enableRefinement: boolean = false,
  generateImages: boolean = false
): Promise<SiteFiles> {
  console.log('Generating site files from schema...');
  
  // Define template paths - using path.resolve to get absolute paths
  const templatesDir = path.resolve(process.cwd(), 'src', 'templates');
  const indexTemplatePath = path.join(templatesDir, 'index.ejs');
  const styleTemplatePath = path.join(templatesDir, 'style.ejs');
  
  // Optional content refinement
  if (enableRefinement && selectedIdea && designPreferences) {
    try {
      console.log('Refining content for better engagement...');
      const refinementPrompt = generateContentRefinementPrompt(
        selectedIdea,
        designPreferences,
        schema
      );
      
      const refinedContentString = await callLLM(refinementPrompt);
      
      try {
        // Fix for handling JSON responses wrapped in markdown code blocks
        let jsonString = refinedContentString;
        
        // Remove markdown code blocks if present
        if (refinedContentString.includes('```json')) {
          jsonString = refinedContentString.replace(/```json\n|\n```/g, '');
        } else if (refinedContentString.includes('```')) {
          jsonString = refinedContentString.replace(/```\n|\n```/g, '');
        }
        
        // Parse the JSON
        const refinedContent = JSON.parse(jsonString);
        
        // Replace the original copy blocks with refined ones
        schema.copyBlocks = {
          ...schema.copyBlocks, // Keep the original as fallback
          ...refinedContent     // Override with refined content
        };
        
        console.log("Content successfully refined for improved engagement.");
      } catch (parseError: unknown) {
        console.warn("Failed to parse refined content:", (parseError as Error).message);
        console.log("Continuing with original content.");
      }
    } catch (refinementError: unknown) {
      console.warn("Content refinement skipped due to error:", (refinementError as Error).message);
      console.log("Continuing with original content.");
    }
  }
  
  // Optional image generation
  let imageResults: Record<string, ImageGenerationResult> = {};
  if (generateImages) {
    try {
      console.log('Generating images for the landing page...');
      // Cast schema to LandingPageSchema since we know it has the required structure
      imageResults = await generateImagesFromSchema(schema as unknown as LandingPageSchema);
      
      // Add image paths to schema for template use
      schema.generatedImages = {};
      for (const [key, result] of Object.entries(imageResults)) {
        const typedResult = result as ImageGenerationResult;
        if (typedResult.success && typedResult.localPaths && typedResult.localPaths.length > 0) {
          // Use relative path for templates (base will be the site directory)
          schema.generatedImages[key] = `images/${path.basename(typedResult.localPaths[0])}`;
        }
      }
    } catch (imageError) {
      console.warn('Image generation skipped due to error:', (imageError as Error).message);
      console.log('Continuing with placeholder images.');
    }
  }
  
  // Generate the HTML and CSS content using EJS templates
  try {
    console.log('Rendering HTML template...');
    const htmlContent = await ejs.renderFile(indexTemplatePath, schema);
    
    console.log('Rendering CSS template...');
    const cssContent = await ejs.renderFile(styleTemplatePath, schema);
    
    console.log('Site files generated successfully!');
    
    return {
      htmlContent,
      cssContent,
      imageResults: Object.keys(imageResults).length > 0 ? imageResults : undefined
    };
  } catch (renderError: unknown) {
    console.error('Error rendering templates:', (renderError as Error).message);
    throw new Error(`Failed to render templates: ${(renderError as Error).message}`);
  }
} 