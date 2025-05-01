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
