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