/**
 * Parser Utilities
 * 
 * Contains functions for parsing and extracting structured data
 * from unstructured text responses (like LLM outputs).
 */

/**
 * Extract ideas from LLM response text
 * @param {string} responseText - Raw text from LLM containing ideas
 * @returns {string[]} Array of parsed ideas
 */
export function parseIdeas(responseText: string): string[] {
  // Log the raw response for debugging
  console.log('\nRaw LLM response:', responseText);
  
  // Extract ideas from the response
  const ideas: string[] = [];
  
  // Primary approach: Look for numbered list items (most likely format with our prompt)
  const numberedPattern = /^\s*(\d+)[\.|\)]\s+(.+)$/gm;
  let match;
  
  while ((match = numberedPattern.exec(responseText)) !== null) {
    const idea = match[2].trim();
    if (idea && idea.length > 10) {
      ideas.push(idea);
    }
  }
  
  // If primary approach found ideas, return them
  if (ideas.length > 0) {
    console.log(`Found ${ideas.length} ideas using numbered list pattern`);
    return ideas.slice(0, 10);
  }
  
  // Secondary approach: Try to find lines that contain a dash between name and description
  console.log('No numbered list found, trying secondary pattern...');
  const lines = responseText.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    // Skip empty lines, headers, or very short lines
    if (!trimmedLine || trimmedLine.length < 10 || /^#/.test(trimmedLine)) {
      continue;
    }
    
    // Look for format "[Name] - [Description]" or similar
    const nameDashDescPattern = /(.+?)(?:\s*[-:]\s*)(.+)/;
    const dashMatch = trimmedLine.match(nameDashDescPattern);
    
    if (dashMatch && dashMatch[1] && dashMatch[2]) {
      ideas.push(trimmedLine);
    } 
    // If no dash found but line seems substantial, include it as is
    else if (trimmedLine.length > 30) {
      ideas.push(trimmedLine);
    }
  }
  
  // Tertiary approach: Just split by double newlines if we still have nothing
  if (ideas.length === 0) {
    console.log('Secondary pattern found no ideas, using tertiary approach...');
    const paragraphs = responseText.split(/\n\n+/);
    
    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (trimmedParagraph && trimmedParagraph.length > 30) {
        ideas.push(trimmedParagraph);
      }
    }
  }
  
  // Final approach: If all else fails, just return the entire response as one idea
  if (ideas.length === 0 && responseText.trim().length > 0) {
    console.log('All parsing methods failed, using entire response as one idea');
    
    // Truncate if too long
    const maxLength = 200;
    const truncatedResponse = responseText.trim().length > maxLength 
      ? responseText.trim().substring(0, maxLength) + '...'
      : responseText.trim();
      
    ideas.push(truncatedResponse);
  }
  
  // Log the number of ideas found
  console.log(`Parsed ${ideas.length} ideas from LLM response`);
  
  // Limit to 10 ideas
  return ideas.slice(0, 10);
} 

/**
 * Interface for the landing page schema
 */
export interface LandingPageSchema {
  brandName: string;
  tagline: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  font: {
    heading: string;
    body: string;
  };
  copyBlocks: {
    headline: string;
    subheadline: string;
    valueProposition: string;
    featuresList: string[];
    callToAction: string;
  };
  imagePrompts: {
    hero: string;
    feature1: string;
    feature2: string;
  };
  formText: {
    title: string;
    emailPlaceholder: string;
    submitButton: string;
    thankYouMessage: string;
  };
}

/**
 * Parse and validate a schema JSON response from the LLM
 * @param {string} responseText - Raw JSON text from LLM containing the schema
 * @returns {LandingPageSchema} Parsed and validated schema object
 * @throws {Error} If parsing fails or schema is invalid
 */
export function parseSchema(responseText: string): LandingPageSchema {
  // Log the raw response length for debugging (might be large)
  console.log(`\nRaw schema response length: ${responseText.length} characters`);
  
  // First, try to extract JSON if it's wrapped in markdown code blocks or has extra text
  let jsonText = responseText;
  
  // Look for JSON between triple backticks
  const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    console.log('Extracted JSON from code block');
    jsonText = codeBlockMatch[1];
  } else {
    // Try to find content between curly braces if no code block found
    const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      console.log('Extracted JSON using brace matching');
      jsonText = jsonMatch[0];
    }
  }
  
  // Attempt to fix common JSON errors before parsing
  let correctedJsonText = jsonText;
  
  // Fix 1: Remove any trailing commas before closing brackets (common LLM error)
  correctedJsonText = correctedJsonText.replace(/,(\s*[\]}])/g, '$1');
  
  // Fix 2: Add missing commas between properties (look for "}\n{" or similar patterns)
  correctedJsonText = correctedJsonText.replace(/(["\w])\s*\}(\s*)"([^"]+)"/g, '$1},$2"$3"');
  
  // Fix the common pattern where a colon is missing after a property name
  correctedJsonText = correctedJsonText.replace(/"([^"]+)"\s+(["{[])/g, '"$1": $2');
  
  // Fix missing quotes around property values (look for key: value without quotes)
  correctedJsonText = correctedJsonText.replace(/"([^"]+)":\s*([^",\{\[\]\}\d][^",\{\[\]\}\s]*)\s*([,\}])/g, '"$1": "$2"$3');
  
  // Fix duplicate commas
  correctedJsonText = correctedJsonText.replace(/,\s*,/g, ',');
  
  // If we made corrections, log this
  if (correctedJsonText !== jsonText) {
    console.log('Applied JSON error correction');
  }
  
  // Try to parse the JSON
  let schema: LandingPageSchema;
  try {
    schema = JSON.parse(correctedJsonText);
  } catch (error) {
    // If the corrected parsing fails, try a more aggressive approach
    console.error('JSON parsing error:', error instanceof Error ? error.message : String(error));
    console.log('Failed JSON text (first 100 chars):', correctedJsonText.substring(0, 100) + '...');
    
    try {
      // Last resort: Try JSONFix (a simplified approach to fix common JSON errors)
      const aggressivelyFixed = simplifiedJSONFix(correctedJsonText);
      console.log('Attempting to parse with aggressive JSON fixing');
      schema = JSON.parse(aggressivelyFixed);
    } catch (innerError) {
      throw new Error('Failed to parse schema JSON: Invalid format');
    }
  }
  
  // Validate required fields and structure
  const requiredFields = [
    'brandName',
    'tagline',
    'palette',
    'font',
    'copyBlocks',
    'imagePrompts',
    'formText'
  ];
  
  const missingFields = requiredFields.filter(field => !schema[field as keyof LandingPageSchema]);
  
  if (missingFields.length > 0) {
    throw new Error(`Schema is missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Validate sub-structures
  if (!schema.palette.primary || !schema.palette.secondary || !schema.palette.accent) {
    throw new Error('Schema palette is missing required color values');
  }
  
  if (!schema.font.heading || !schema.font.body) {
    throw new Error('Schema font is missing required font values');
  }
  
  if (!schema.copyBlocks.headline || !schema.copyBlocks.subheadline || !schema.copyBlocks.callToAction) {
    throw new Error('Schema copyBlocks is missing required text content');
  }
  
  if (!Array.isArray(schema.copyBlocks.featuresList) || schema.copyBlocks.featuresList.length === 0) {
    // Fix featuresList if it's missing or not an array
    console.log('Warning: featuresList is missing or invalid, adding placeholder');
    schema.copyBlocks.featuresList = ['Feature 1', 'Feature 2', 'Feature 3'];
  }
  
  // Validate color codes in palette
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const paletteColors = [
    'primary', 'secondary', 'accent', 'background', 'text'
  ];
  
  // Convert and fix any color values that aren't proper hex codes
  paletteColors.forEach(colorKey => {
    const colorValue = schema.palette[colorKey as keyof typeof schema.palette];
    if (typeof colorValue === 'string') {
      if (!hexColorRegex.test(colorValue)) {
        console.log(`Warning: ${colorKey} color "${colorValue}" is not a valid hex code, converting to default`);
        // Assign a default color
        const defaults: Record<string, string> = {
          primary: '#4285f4',
          secondary: '#34a853',
          accent: '#ea4335',
          background: '#ffffff',
          text: '#202124'
        };
        schema.palette[colorKey as keyof typeof schema.palette] = defaults[colorKey];
      }
    } else {
      // If color value is missing or not a string, set a default
      console.log(`Warning: ${colorKey} color is missing or invalid, setting default`);
      const defaults: Record<string, string> = {
        primary: '#4285f4',
        secondary: '#34a853',
        accent: '#ea4335',
        background: '#ffffff',
        text: '#202124'
      };
      schema.palette[colorKey as keyof typeof schema.palette] = defaults[colorKey];
    }
  });
  
  console.log('✅ Schema validation successful');
  return schema;
}

/**
 * A simplified JSON error correction function for cases where regular fixes fail
 * This is a last-resort approach that may not preserve all data integrity
 * @param {string} brokenJson - The malformed JSON text
 * @returns {string} A hopefully fixed JSON text
 */
function simplifiedJSONFix(brokenJson: string): string {
  let lines = brokenJson.split('\n');
  let fixed = [];
  let inArray = false;
  let openBraces = 0;
  let openBrackets = 0;
  
  // Process line by line
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Count braces and brackets
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '{') openBraces++;
      if (line[j] === '}') openBraces--;
      if (line[j] === '[') {
        openBrackets++;
        inArray = true;
      }
      if (line[j] === ']') {
        openBrackets--;
        if (openBrackets === 0) inArray = false;
      }
    }
    
    // Check for common issues in the current line
    
    // Fix missing colons
    if (line.match(/"[^"]+"\s+[^:,]/) && !line.includes(':')) {
      line = line.replace(/"([^"]+)"\s+/, '"$1": ');
    }
    
    // Fix missing quotes around values
    if (line.match(/"[^"]+"\s*:\s*[^"{[\d][^",{[}\]]*[,}]/) && !line.match(/"[^"]+"\s*:\s*"[^"]*"[,}]/)) {
      line = line.replace(/"([^"]+)"\s*:\s*([^",{[\d][^",{[}\]]*?)([,}])/, '"$1": "$2"$3');
    }
    
    // Fix missing commas at end of property lines
    if (i < lines.length - 1 && !line.endsWith(',') && !line.endsWith('{') && !line.endsWith('[') && 
        !line.endsWith('}') && !line.endsWith(']') && !inArray) {
      let nextLine = lines[i+1].trim();
      if ((nextLine.startsWith('"') || nextLine.startsWith('}')) && !line.endsWith(',')) {
        line += ',';
      }
    }
    
    // Fix trailing commas at the end of objects/arrays
    if (line.endsWith(',') && i < lines.length - 1) {
      let nextLine = lines[i+1].trim();
      if (nextLine.startsWith('}') || nextLine.startsWith(']')) {
        line = line.slice(0, -1);
      }
    }
    
    fixed.push(line);
  }
  
  return fixed.join('\n');
} 