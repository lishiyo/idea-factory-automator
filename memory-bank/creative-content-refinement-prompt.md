# Creative Design Decision: Content Refinement Prompt

(Subtask 8) - This prompt would refine raw copy ideas from the schema into more polished, engaging content before inserting into templates.

## Requirements & Constraints

Content Refinement Prompt Requirements (Optional):
- Must preserve the semantic intent of the original content
- Must generate SEO-friendly copy with clear calls to action
- Must maintain the tone indicated by design preferences
- Should enhance persuasiveness and engagement
- Should format content appropriately for web (short paragraphs, etc.)

Technical Constraints:
- Prompts will be sent to OpenRouter (targeting models like GPT-4o)
- Need to optimize token usage while maintaining reliability
- Need to handle potential model hallucinations or formatting errors

We are going with *Option 2*:

```
You are an expert copywriter specializing in landing pages. Refine the following copy blocks for a startup idea:
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


Return ONLY a JSON object with the same structure as the original, but with enhanced copy.
```

Example code:
```javascript
// In llmService.js or promptUtils.js
export function generateContentRefinementPrompt(selectedIdea, designPreferences, schema) {
  return `You are an expert copywriter specializing in landing pages. Refine the following copy blocks for a startup idea:
"${selectedIdea}"

The design style is: "${designPreferences}"
The brand name is: "${schema.brandName}"
The target audience: People interested in solutions related to this idea.

Original copy blocks:
${JSON.stringify(schema.copyBlocks, null, 2)}

Transform these blocks using these principles:
1. Use a tone that matches the "${designPreferences}" design style
2. Make the headline more attention-grabbing (max 10 words)
3. Ensure the subheadline clearly explains the value proposition (max 20 words)
4. Make feature descriptions concrete and benefit-focused
5. Create a compelling call to action that creates urgency

Return ONLY a JSON object with the same structure as the original, but with enhanced copy.`;
}

// In siteGenerator.js (Optional Subtask 8 enhancement)
import { callLLM } from '../services/llmService.js';
import { generateContentRefinementPrompt } from '../utils/promptUtils.js'; // if separated

// Within the generateSiteFiles function, before using schema with templates
async function generateSiteFiles(schema, selectedIdea, designPreferences) {
  // Optional: Refine copy before rendering if refinement is enabled
  // (Could be controlled via a config option or additional parameter)
  if (ENABLE_CONTENT_REFINEMENT) {
    try {
      const refinementPrompt = generateContentRefinementPrompt(
        selectedIdea, 
        designPreferences, 
        schema
      );
      
      const refinedContentString = await callLLM(refinementPrompt);
      const refinedContent = JSON.parse(refinedContentString);
      
      // Replace the original copy blocks with refined ones
      schema.copyBlocks = {
        ...schema.copyBlocks, // Keep the original as fallback
        ...refinedContent     // Override with refined content
      };
      
      console.log("Content successfully refined for improved engagement.");
    } catch (error) {
      // If refinement fails, continue with original content
      console.log("Content refinement skipped due to error:", error.message);
    }
  }
  
  // Continue with template rendering using the schema (original or refined)
  // ...rest of the function
}
```