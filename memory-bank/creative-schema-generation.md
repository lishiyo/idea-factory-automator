# Creative Design Decision - Schema Generation Prompt

(Subtask 6) - This prompt needs to reliably generate a structured JSON schema based on the user's selected idea and design preferences, containing brand elements, color palette, typography, copy blocks, and form text.

## Requirements & Constraints

Schema Generation Prompt Requirements:
- Must reliably produce valid, parsable JSON (critical for program flow)
- Must follow the exact schema structure expected by templates
- Must incorporate user's topic, selected idea, and design preferences
- Should generate creative but appropriate brand elements
- Must be consistent with the idea's theme and design preferences
- Must include all required fields with reasonable fallbacks

We have chosen *Option 4*: Step-by-Step Generation with JSON Verification:

```
I need to generate a valid JSON schema for a landing page about the following startup idea: "${selectedIdea}"

The design style preference is: "${designPreferences}"

Follow these steps:
1. Create a brand name that is catchy, memorable, and relevant to the idea.
2. Select a color palette with primary, secondary, and accent colors (as hex codes) that match the design style.
3. Choose font families for headings and body text that complement the design style.
4. Write compelling copy blocks including headline, subheadline, three features, and call to action.
5. Create image prompts for the hero section and each feature.
6. Write form text including title, email placeholder, and submit button text.

After completing these steps, combine everything into a valid JSON object with this exact structure:
{
  "brandName": string,
  "palette": {
    "primary": string,
    "secondary": string,
    "accent": string
  },
  "font": {
    "heading": string,
    "body": string
  },
  "copyBlocks": {
    "headline": string,
    "subheadline": string,
    "featureTitle1": string,
    "featureDescription1": string,
    "featureTitle2": string,
    "featureDescription2": string,
    "featureTitle3": string,
    "featureDescription3": string,
    "callToAction": string
  },
  "imagePrompts": {
    "hero": string,
    "feature1": string,
    "feature2": string,
    "feature3": string
  },
  "formText": {
    "title": string,
    "emailPlaceholder": string,
    "submitButton": string
  }
}

IMPORTANT:
- Return ONLY the final JSON object with no additional text, comments, or explanations.
- Ensure all JSON syntax is correct with proper quotes, commas, and braces.
- Verify that there are no trailing commas or syntax errors before responding.
- Make sure all fields are filled with appropriate values.
```

Example code:
```javascript
// In llmService.js or a specialized promptUtils.js
export function generateSchemaPrompt(selectedIdea, designPreferences) {
  return `I need to generate a valid JSON schema for a landing page about the following startup idea: "${selectedIdea}"

The design style preference is: "${designPreferences}"

Follow these steps:
1. Create a brand name that is catchy, memorable, and relevant to the idea.
2. Select a color palette with primary, secondary, and accent colors (as hex codes) that match the design style.
3. Choose font families for headings and body text that complement the design style.
4. Write compelling copy blocks including headline, subheadline, three features, and call to action.
5. Create image prompts for the hero section and each feature.
6. Write form text including title, email placeholder, and submit button text.

After completing these steps, combine everything into a valid JSON object with this exact structure:
{
  "brandName": string,
  "palette": {
    "primary": string,
    "secondary": string,
    "accent": string
  },
  "font": {
    "heading": string,
    "body": string
  },
  "copyBlocks": {
    "headline": string,
    "subheadline": string,
    "featureTitle1": string,
    "featureDescription1": string,
    "featureTitle2": string,
    "featureDescription2": string,
    "featureTitle3": string,
    "featureDescription3": string,
    "callToAction": string
  },
  "imagePrompts": {
    "hero": string,
    "feature1": string,
    "feature2": string,
    "feature3": string
  },
  "formText": {
    "title": string,
    "emailPlaceholder": string,
    "submitButton": string
  }
}

IMPORTANT:
- Return ONLY the final JSON object with no additional text, comments, or explanations.
- Ensure all JSON syntax is correct with proper quotes, commas, and braces.
- Verify that there are no trailing commas or syntax errors before responding.
- Make sure all fields are filled with appropriate values.`;
}

// In index.js (Subtask 6 implementation)
import { callLLM } from './services/llmService.js';
import { generateSchemaPrompt } from './utils/promptUtils.js'; // if separated

// Within the schema generation loop
const schemaPrompt = generateSchemaPrompt(selectedIdea, designPreferences);
let schemaString;
let parsedSchema;
let retryCount = 0;
const MAX_RETRIES = 3;

while (retryCount < MAX_RETRIES) {
  try {
    schemaString = await callLLM(schemaPrompt);
    
    // Try to parse the JSON response
    parsedSchema = JSON.parse(schemaString);
    
    // Basic validation that the schema has the expected structure
    if (!parsedSchema.brandName || !parsedSchema.palette || !parsedSchema.copyBlocks) {
      console.log("Generated schema is missing required sections. Retrying...");
      retryCount++;
      continue;
    }
    
    // Schema looks valid, ask for user confirmation
    const confirmation = await confirmSchema(parsedSchema);
    
    if (confirmation === 'approve') {
      approvedSchema = parsedSchema;
      break;
    } else if (confirmation === 'regenerate') {
      console.log("Regenerating schema based on user request...");
      retryCount = 0; // Reset retry counter for explicit regeneration requests
      continue;
    } else {
      // User cancelled
      console.log("Operation cancelled by user.");
      process.exit(0);
    }
  } catch (error) {
    console.log(`Error parsing schema (attempt ${retryCount + 1}/${MAX_RETRIES}): ${error.message}`);
    retryCount++;
  }
}

if (retryCount >= MAX_RETRIES) {
  console.error("Failed to generate a valid schema after multiple attempts. Please try again later.");
  process.exit(1);
}
```