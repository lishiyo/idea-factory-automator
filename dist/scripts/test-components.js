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
import { getTopic } from '../src/cli.js';
import { callLLM } from '../src/services/llmService.js';
/**
 * Main test function
 */
async function testComponents() {
    try {
        console.log('🚀 Idea Factory Automator - Component Test');
        console.log('------------------------------------------');
        console.log('🧪 Testing CLI and LLM Service components...');
        // Test CLI by getting a topic from the user
        const topic = await getTopic();
        console.log(`✅ CLI Test: Successfully got topic: "${topic}"`);
        // Construct a simple test prompt for the LLM
        const testPrompt = `Generate a short paragraph about ${topic} for testing purposes. Keep it under 100 words.`;
        console.log('📡 Testing LLM Service with OpenRouter API...');
        // Call the LLM service
        const response = await callLLM(testPrompt);
        // Display the response
        console.log('\n✅ LLM Service Test: Successfully received response from OpenRouter:');
        console.log('-----------------------------------');
        console.log(response);
        console.log('-----------------------------------');
        console.log('\n🎉 All components are working correctly!');
    }
    catch (error) {
        console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.message.includes('API key')) {
            console.error('🔑 Make sure you have set up your .env file with OPENROUTER_API_KEY');
        }
        process.exit(1);
    }
}
// Run the test
testComponents();
//# sourceMappingURL=test-components.js.map