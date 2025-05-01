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
// These imports will be uncommented as we implement each module
import { callLLM, LLMOptions } from './services/llmService.js';
import { generateSiteFiles, SiteFiles } from './managers/siteGenerator.js';
import { createSiteDirectory, saveSiteFiles } from './managers/fileManager.js';
import { deploySite } from './managers/deploymentManager.js';

/**
 * Main application function
 */
async function run(): Promise<void> {
  try {
    console.log('🚀 Welcome to Idea Factory Automator!');
    console.log('-------------------------------------');
    
    // TODO: Implement full workflow in subsequent tasks
    console.log('This is a placeholder. Implementation coming soon!');
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Execute main function
run(); 