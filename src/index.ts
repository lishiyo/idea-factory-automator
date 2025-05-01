#!/usr/bin/env node

/**
 * Idea Factory Automator
 * 
 * Main orchestrator that coordinates the workflow:
 * 1. Gets user input (topic, idea selection, design preferences)
 * 2. Generates ideas and schema with LLM
 * 3. Creates landing page files
 * 4. Saves files locally
 * 5. Deploys to Netlify-watched repo
 */

import 'dotenv/config';
import { getTopic, selectIdea, getDesignPreferences, confirmSchema, SchemaAction } from './cli.js';
import { callLLM, LLMOptions } from './services/llmService.js';
import { parseIdeas } from './utils/parsers.js';
// These imports will be uncommented as we implement each module
// import { generateSiteFiles, SiteFiles } from './managers/siteGenerator.js';
// import { createSiteDirectory, saveSiteFiles } from './managers/fileManager.js';
// import { deploySite } from './managers/deploymentManager.js';

/**
 * Main application function
 */
async function run(): Promise<void> {
  try {
    console.log('🚀 Welcome to Idea Factory Automator!');
    console.log('-------------------------------------');
    
    // Step 1: Get the user's topic of interest
    const topic = await getTopic();
    console.log(`📝 Great! We'll explore startup ideas related to "${topic}".`);
    
    // Step 2: Generate ideas using the LLM
    console.log('🧠 Generating startup ideas... (this may take a moment)');
    
    const ideaPrompt = `Generate exactly 10 innovative and viable startup ideas related to "${topic}".

IMPORTANT: Format your response as a numbered list (1-10), with each idea on its own line.
For each idea, include a name and a brief one-sentence description using this exact format:
"[Idea Name] - [Brief Description]"

Example format:
1. PawPlay - Interactive toy that simulates hunting for indoor cats.
2. FurStyle - Customizable cat furniture that matches home decor.

Make sure all 10 ideas are concise, practical, and marketable. Do not include any additional commentary, viability checks, or explanations.
`;
    
    const llmOptions: LLMOptions = {
      temperature: 0.8, // Higher temperature for more creativity
      max_tokens: 1500, // Enough tokens for 10 decent-sized ideas
    };
    
    const ideasResponse = await callLLM(ideaPrompt, llmOptions);

    // Step 3: Parse the ideas from the response
    const ideas = parseIdeas(ideasResponse);
    
    if (ideas.length === 0) {
      throw new Error('Failed to generate any viable ideas. Please try again.');
    }
    
    console.log(`✅ Generated ${ideas.length} startup ideas!`);
    
    // Step 4: Let the user select an idea
    const selectedIdea = await selectIdea(ideas);
    console.log(`🎯 Selected idea: "${selectedIdea}"`);
    
    console.log('\n✨ Success! Idea selected.');
    console.log('Next steps will include getting design preferences and generating a landing page schema.');
    
    // Store the topic and selected idea in an object to pass to the next steps
    const projectData = {
      topic,
      selectedIdea,
    };
    
    // Log the data for debugging
    console.log('\nProject data:', projectData);
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Execute main function
run(); 