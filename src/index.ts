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
import { getTopic, selectIdea, getDesignPreferences } from './cli.js';
import { callLLM, LLMOptions } from './services/llmService.js';
import { parseIdeas } from './utils/parsers.js';
import { generateSiteSchema } from './services/schemaService.js';
// Uncomment these modules that we've now implemented
import { generateSiteFiles, SiteFiles } from './managers/siteGenerator.js';
import { createSiteDirectory, saveSiteFiles } from './managers/fileManager.js';
// Import image service functions
import { saveGeneratedImages } from './services/imageService.js';
// This one will be for Subtask 10
// import { deploySite } from './managers/deploymentManager.js';
import path from 'path';

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
    
    // Step 5: Get design preferences
    const designStyle = await getDesignPreferences();
    console.log(`🎨 Design style selected: "${designStyle}"`);
    
    // Step 6: Generate and approve site schema
    console.log('\n📋 Now we\'ll generate a schema for your landing page...');
    const schema = await generateSiteSchema(selectedIdea, designStyle);
    
    // Store the complete project data
    const projectData = {
      topic,
      selectedIdea,
      designStyle,
      schema
    };
    
    console.log('\n✨ Success! Schema approved.');
    
    // Step 7: Generate HTML and CSS files
    console.log('\n🔨 Generating landing page files...');
    const siteFiles: SiteFiles = await generateSiteFiles(
      schema, 
      selectedIdea,
      designStyle,
      true, // Enable content refinement
      true  // Enable image generation
    );
    console.log('✅ HTML and CSS files generated successfully.');
    
    // Step 8: Save the files locally
    console.log('\n💾 Saving files locally...');
    // Define base output directory
    const baseOutputDir = path.resolve(process.cwd(), 'output');
    // Create site-specific directory based on brand name
    const siteDirectory = await createSiteDirectory(baseOutputDir, schema.brandName);
    // Save the HTML and CSS files
    await saveSiteFiles(siteDirectory, siteFiles.htmlContent, siteFiles.cssContent);
    console.log(`✅ Files saved to: ${siteDirectory}`);
    
    // Images are now saved during site generation, so we don't need to save them again here
    
    // Step 9: Deployment (will be implemented in Subtask 10)
    console.log('\n🚀 Landing page created successfully!');
    console.log(`📂 Your site files are available at: ${siteDirectory}`);
    console.log('Deployment to Netlify will be added in a future update.');
    
    // Log the path to open the site locally
    console.log(`\n👀 To view your landing page, open this file in your browser:`);
    console.log(`📄 ${path.join(siteDirectory, 'index.html')}`);
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Execute main function
run(); 