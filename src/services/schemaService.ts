/**
 * Schema Service
 * 
 * Handles the generation of landing page schemas using the LLM
 * and manages the schema approval flow.
 */

import { callLLM, LLMOptions } from './llmService.js';
import { parseSchema, LandingPageSchema } from '../utils/parsers.js';
import { confirmSchema, SchemaAction } from '../cli.js';

/**
 * Generates the prompt for schema generation based on the selected idea and design style
 * @param {string} selectedIdea - The idea selected by the user
 * @param {string} designStyle - The design style preference
 * @returns {string} - The prompt for the LLM
 */
function generateSchemaPrompt(selectedIdea: string, designStyle: string): string {
  return `You are a brilliant website designer and creative director. We need to generate a valid JSON schema for a landing page about the following startup idea: "${selectedIdea}"

The design style preference is: "${designStyle}"

Follow these steps:
1. Create a brand name that is catchy, memorable, and relevant to the idea.
2. Create a short, memorable tagline for the brand.
3. Select a color palette with primary, secondary, accent, background, and text colors (as hex codes) that match the design style.
4. Choose font families for headings and body text that complement the design style (use widely available web fonts).
5. Write compelling copy blocks including headline, subheadline, value proposition, a list of features, and call to action.
6. Create image prompts for the hero section and supporting feature images.
7. Write form text including title, email placeholder, submit button text, and thank you message.

After completing these steps, combine everything into a valid JSON object with this exact structure:
{
  "brandName": string,
  "tagline": string,
  "palette": {
    "primary": string,
    "secondary": string,
    "accent": string,
    "background": string,
    "text": string
  },
  "font": {
    "heading": string,
    "body": string
  },
  "copyBlocks": {
    "headline": string,
    "subheadline": string,
    "valueProposition": string,
    "featuresList": [string, string, string],
    "callToAction": string
  },
  "imagePrompts": {
    "hero": string,
    "feature1": string,
    "feature2": string
  },
  "formText": {
    "title": string,
    "emailPlaceholder": string,
    "submitButton": string,
    "thankYouMessage": string
  }
}

CRITICAL JSON FORMATTING RULES:
- Return ONLY the final JSON object with no additional text, comments, explanations, or code fences.
- All string values must be enclosed in double quotes: "like this".
- Property names must always be enclosed in double quotes: "propertyName": "value"
- Always place a colon between property names and values: "property": "value"
- Always place commas between properties: "property1": "value1", "property2": "value2"
- NEVER place a trailing comma after the last property: "lastProperty": "value" }
- Arrays need to be in square brackets with comma-separated values: ["item1", "item2", "item3"]
- The featuresList must be a proper JSON array with comma-separated strings.
- Use proper hex color codes (e.g., #FF5733) for all palette colors.
- Double-check your JSON before submitting to ensure it's valid and properly formatted.`;
}

/**
 * Generates a site schema based on the selected idea and design style
 * @param {string} selectedIdea - The idea selected by the user
 * @param {string} designStyle - The design style preference
 * @returns {Promise<LandingPageSchema>} - The approved schema object
 * @throws {Error} - If schema generation fails after maximum attempts
 */
export async function generateSiteSchema(
  selectedIdea: string, 
  designStyle: string
): Promise<LandingPageSchema> {
  let approvedSchema: LandingPageSchema | null = null;
  let schemaAttempts = 0;
  const MAX_ATTEMPTS = 3;
  
  // Extract the idea name for potential use in branding
  const ideaNameMatch = selectedIdea.match(/^(.*?)(?:\s+-\s+|\s*:\s*)/);
  const ideaName = ideaNameMatch ? ideaNameMatch[1].trim() : "YourBrand";
  
  // Schema generation loop
  while (!approvedSchema && schemaAttempts < MAX_ATTEMPTS) {
    schemaAttempts++;
    console.log(`\n🧠 Generating site schema (attempt ${schemaAttempts}/${MAX_ATTEMPTS})...`);
    
    const schemaPrompt = generateSchemaPrompt(selectedIdea, designStyle);
    
    const schemaOptions: LLMOptions = {
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" } // Request JSON format if the LLM supports it
    };
    
    try {
      const schemaResponse = await callLLM(schemaPrompt, schemaOptions);
      
      // Parse and validate the schema using our utility
      const schemaObject = parseSchema(schemaResponse);
      
      // Get user confirmation
      const action = await confirmSchema(schemaObject);
      
      switch (action) {
        case 'approve':
          approvedSchema = schemaObject;
          console.log('✅ Schema approved!');
          break;
        case 'regenerate':
          console.log('🔄 Regenerating schema...');
          break;
        case 'cancel':
          console.log('❌ Process cancelled by user.');
          process.exit(0); // Exit process with success code
      }
    } catch (error) {
      console.error(`❌ Schema generation error: ${error instanceof Error ? error.message : String(error)}`);
      
      if (schemaAttempts >= MAX_ATTEMPTS) {
        throw new Error(`Failed to generate a valid schema after ${MAX_ATTEMPTS} attempts`);
      }
      
      console.log('🔄 Trying again...');
    }
  }
  
  if (!approvedSchema) {
    throw new Error('Schema generation failed without a specific error.');
  }
  
  return approvedSchema;
} 