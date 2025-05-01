/**
 * LLM Service Module
 * 
 * Handles interactions with the OpenRouter API (or other LLM providers).
 * Manages API requests, response parsing, and error handling.
 */

import axios from 'axios';

/**
 * Call the LLM API with a prompt
 * @param {string} prompt The text prompt to send to the LLM
 * @param {Object} options Optional parameters like model, temperature, etc.
 * @returns {Promise<string>} The LLM response text
 */
export async function callLLM(prompt, options = {}) {
  try {
    // Get API key from environment variables
    const apiKey = process.env.OPENROUTER_API_KEY;
    const defaultModel = process.env.DEFAULT_LLM_MODEL;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not found. Please set OPENROUTER_API_KEY in your .env file.');
    }
    
    console.log(`🧠 Calling LLM with prompt: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`);
    
    // Default model if not specified in options
    const model = options.model || defaultModel;
    
    // Set up the request headers
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // OpenRouter specific headers
      'HTTP-Referer': 'https://idea-factory-automator',
      'X-Title': 'Idea Factory Automator'
    };
    
    // Set up the request body
    const body = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000
    };
    
    // Make the API call
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', body, { headers });
    
    // Extract and return the response text
    const responseText = response.data.choices[0].message.content;
    return responseText;
    
  } catch (error) {
    // Enhanced error handling
    console.error('❌ LLM API Error:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from LLM API');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(`Error message: ${error.message}`);
    }
    
    throw new Error(`Failed to get response from LLM: ${error.message}`);
  }
}
