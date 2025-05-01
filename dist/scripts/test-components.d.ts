#!/usr/bin/env node
/**
 * Test Components Script
 *
 * This script tests the CLI and LLM service components by:
 * 1. Using the CLI interface to prompt for a topic
 * 2. Taking the topic and creating a simple prompt for the LLM
 * 3. Calling the LLM with the prompt
 * 4. Displaying the response
 *
 * Run with: npm run test-components
 */
import 'dotenv/config';
